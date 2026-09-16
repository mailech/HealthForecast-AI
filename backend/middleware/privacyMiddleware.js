const crypto = require('crypto');

// Secret salt for research pseudonyms
const RESEARCH_SALT = process.env.RESEARCH_SALT || 'healthforecast_safe_harbor_salt_2026';

/**
 * Generate deterministic HIPAA-compliant pseudonym for research subjects
 * Example: PT-222157 -> RES-PT-7F8A3B
 */
const generateResearchPseudonym = (idStr) => {
  if (!idStr) return 'RES-SUBJECT-000000';
  const hash = crypto.createHmac('sha256', RESEARCH_SALT).update(String(idStr)).digest('hex');
  return `RES-PT-${hash.slice(0, 6).toUpperCase()}`;
};

/**
 * Extract Year-only under HIPAA Safe Harbor standard
 * Strips month, day, hours, minutes, seconds
 */
const generalizeToYear = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}`;
};

/**
 * Recursively sanitize and mask PII fields for Healthcare Researchers
 */
const maskPiiRecursively = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => maskPiiRecursively(item));
  }

  // Handle Mongoose documents or plain objects
  if (typeof data === 'object') {
    const raw = data.toObject ? data.toObject() : data;
    const sanitized = {};

    for (const [key, value] of Object.entries(raw)) {
      // 1. Strip direct personal identifiers completely
      if (['firstName', 'lastName'].includes(key)) {
        sanitized[key] = 'RESEARCH_SUBJECT';
        continue;
      }

      if (['email', 'userEmail', 'phone', 'contact', 'address', 'ipAddress', 'userAgent'].includes(key)) {
        // Strip field completely from researcher responses
        continue;
      }

      // 2. Pseudonymize patient identifiers
      if (key === 'patientId') {
        sanitized['researchId'] = generateResearchPseudonym(value);
        sanitized[key] = generateResearchPseudonym(value);
        continue;
      }

      // 3. Mask database ObjectIds to prevent timestamp extraction
      const isObjectId = value && (
        value._bsontype === 'ObjectId' || 
        value._bsontype === 'ObjectID' || 
        (typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') ||
        (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value))
      );
      if (key === '_id' && isObjectId) {
        sanitized[key] = `RES-OBJ-${crypto.createHash('md5').update(value.toString()).digest('hex').slice(0, 8)}`;
        continue;
      }

      // 4. Doctor reference sanitization (retain ONLY clinical specialty)
      if (key === 'assignedDoctor') {
        if (value && typeof value === 'object') {
          sanitized[key] = {
            specialty: value.specialty || 'General Medicine'
          };
        } else {
          sanitized[key] = null;
        }
        continue;
      }

      // 5. User / Creator references (e.g. runBy in predictions)
      if (key === 'runBy') {
        if (value && typeof value === 'object') {
          sanitized[key] = {
            role: value.role || 'clinician'
          };
        } else {
          sanitized[key] = null;
        }
        continue;
      }

      // 6. HIPAA Safe Harbor Date Generalization
      // Strips exact day/month/time; keeps Year
      if (['admissionDate', 'dischargeDate'].includes(key)) {
        const yearKey = key === 'admissionDate' ? 'admissionYear' : 'dischargeYear';
        sanitized[yearKey] = generalizeToYear(value);
        // Expose generalized year string
        sanitized[key] = `${generalizeToYear(value)}-XX-XX (HIPAA De-identified)`;
        continue;
      }

      if (['createdAt', 'updatedAt'].includes(key)) {
        sanitized[key] = `${generalizeToYear(value)} (Generalized)`;
        continue;
      }

      // 7. Clinical free-text narratives that could contain personal remarks
      if (key === 'allergies') {
        // Generalize allergies to standardized types without clinical personal notes
        if (Array.isArray(value) && value.length > 0) {
          sanitized[key] = value.map(a => (a === 'ANONYMIZED' ? a : 'De-identified Clinical Allergy Entry'));
        } else {
          sanitized[key] = [];
        }
        continue;
      }

      if (key === 'clinicalFeedback') {
        // Strip doctor free-text notes
        sanitized[key] = '[REDACTED: Clinical Provider Notes Restricted Under Researcher IRB]';
        continue;
      }

      // Recursively sanitize nested structures
      sanitized[key] = maskPiiRecursively(value);
    }

    return sanitized;
  }

  return data;
};

/**
 * Express Middleware: Enforces strict dynamic PII masking and field stripping
 * for any request authenticated as 'researcher'.
 */
const researcherPrivacyMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Check if the user authenticated as a Healthcare Researcher
    if (req.user && req.user.role === 'researcher') {
      if (data && typeof data === 'object') {
        // Tag with HIPAA Safe Harbor de-identification compliance metadata
        if (data.data !== undefined) {
          data.data = maskPiiRecursively(data.data);
          data.privacyCompliance = {
            standard: 'HIPAA Safe Harbor (45 CFR § 164.514)',
            piiMasked: true,
            dateGeneralization: 'Year Only (Exact Days/Hours Stripped)',
            pseudonymization: 'HMAC-SHA256 Research Tokens',
            physicianInfo: 'Specialty Only (Names/Emails Stripped)'
          };
        } else {
          data = maskPiiRecursively(data);
        }
      }
    }
    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  researcherPrivacyMiddleware,
  maskPiiRecursively,
  generateResearchPseudonym,
  generalizeToYear
};
