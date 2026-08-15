import { useEffect, useState } from "react";
import { X } from "lucide-react";

function EditPatientModal({
  isOpen,
  patient,
  onClose,
  onUpdatePatient,
}) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    disease: "",
    admission_date: "",
    risk: "Low",
    status: "Stable",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        age: patient.age || "",
        gender: patient.gender || "Male",
        disease: patient.disease || "",
        admission_date:
          patient.admission_date || "",
        risk: patient.risk || "Low",
        status: patient.status || "Stable",
        notes: patient.notes || "",
      });
    }
  }, [patient]);

  if (!isOpen || !patient) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await onUpdatePatient(
        patient.id,
        {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          disease: formData.disease,
          admission_date:
            formData.admission_date || null,
          risk: formData.risk,
          status: formData.status,
          notes: formData.notes || null,
        }
      );
    } catch (error) {
      console.error(
        "Update patient error:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Patient
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Update patient information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={22} />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          {/* NAME */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* AGE */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Age
            </label>

            <input
              name="age"
              type="number"
              min="0"
              max="120"
              value={formData.age}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* GENDER */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* DISEASE */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Disease
            </label>

            <input
              name="disease"
              value={formData.disease}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* ADMISSION DATE */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Admission Date
            </label>

            <input
              name="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* RISK */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Risk Level
            </label>

            <select
              name="risk"
              value={formData.risk}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>
            </select>
          </div>

          {/* STATUS */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Stable">
                Stable
              </option>

              <option value="Admitted">
                Admitted
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="Recovered">
                Recovered
              </option>
            </select>
          </div>

          {/* NOTES */}

          <div className="md:col-span-2">

            <label className="block text-sm font-medium mb-1">
              Medical Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Medical notes..."
            />

          </div>

          {/* BUTTONS */}

          <div className="md:col-span-2 flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Patient"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditPatientModal; 