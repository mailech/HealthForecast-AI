import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function PatientTable({ patients }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userRole = user?.role;

  // Doctor + System Administrator
  const canEdit =
    userRole === "Doctor" ||
    userRole === "System Administrator";

  // System Administrator only
  const canDelete =
    userRole === "System Administrator";

  // Display a short, clean patient ID.
  // The real MongoDB ID is still used internally.
  const getDisplayId = (patientId) => {
    if (!patientId) return "—";

    const id = String(patientId);

    return `PAT-${id.slice(-6).toUpperCase()}`;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-x-auto">

      <table
        className="w-full border-collapse"
        style={{
          minWidth: "1050px",
          tableLayout: "fixed",
        }}
      >

        {/* COLUMN WIDTHS */}
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>


        {/* HEADER */}
        <thead>
          <tr className="bg-blue-600 text-white">

            <th className="px-4 py-4 text-left font-bold">
              Patient ID
            </th>

            <th className="px-4 py-4 text-left font-bold">
              Name
            </th>

            <th className="px-4 py-4 text-center font-bold">
              Age
            </th>

            <th className="px-4 py-4 text-left font-bold">
              Disease
            </th>

            <th className="px-4 py-4 text-center font-bold">
              Risk
            </th>

            <th className="px-4 py-4 text-center font-bold">
              Status
            </th>

            <th className="px-4 py-4 text-center font-bold">
              Actions
            </th>

          </tr>
        </thead>


        {/* BODY */}
        <tbody>

          {patients.map((patient, index) => {

            // REAL backend ID
            const patientId =
              patient.id ||
              patient._id ||
              patient.patient_id;

            // CLEAN UI ID
            const displayId =
              getDisplayId(patientId);

            return (
              <tr
                key={
                  patientId ||
                  `patient-${index}`
                }
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >

                {/* PATIENT ID */}
                <td
                  className="px-4 py-4 align-middle text-gray-700 font-medium"
                  title={
                    patientId
                      ? `Full ID: ${patientId}`
                      : ""
                  }
                >
                  {displayId}
                </td>


                {/* NAME */}
                <td
                  className="px-4 py-4 align-middle text-gray-800 font-semibold truncate"
                  title={patient.name || ""}
                >
                  {patient.name || "—"}
                </td>


                {/* AGE */}
                <td className="px-4 py-4 align-middle text-center text-gray-700">
                  {patient.age ?? "—"}
                </td>


                {/* DISEASE */}
                <td
                  className="px-4 py-4 align-middle text-gray-700 truncate"
                  title={patient.disease || ""}
                >
                  {patient.disease || "—"}
                </td>


                {/* RISK */}
                <td className="px-4 py-4 align-middle text-center">

                  <span
                    className={`inline-flex justify-center items-center min-w-[78px] px-3 py-1 rounded-full text-sm font-semibold ${
                      String(patient.risk).toLowerCase() === "high"
                        ? "bg-red-100 text-red-600"
                        : String(patient.risk).toLowerCase() === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {patient.risk || "—"}
                  </span>

                </td>


                {/* STATUS */}
                <td
                  className="px-4 py-4 align-middle text-center text-gray-700 truncate"
                  title={patient.status || ""}
                >
                  {patient.status || "—"}
                </td>


                {/* ACTIONS */}
                <td className="px-4 py-4 align-middle">

                  <div className="flex justify-center items-center gap-4">

                    {/* VIEW
                        Doctor
                        Hospital Administrator
                        System Administrator
                    */}
                    {patientId && (
                      <Link
                        to={`/patients/${patientId}`}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Patient"
                      >
                        <FaEye size={17} />
                      </Link>
                    )}


                    {/* EDIT
                        Doctor
                        System Administrator
                    */}
                    {canEdit && patientId && (
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-800 transition"
                        title="Edit Patient"
                        onClick={() =>
                          alert(
                            "Patient editing will be implemented next."
                          )
                        }
                      >
                        <FaEdit size={17} />
                      </button>
                    )}


                    {/* DELETE
                        System Administrator only
                    */}
                    {canDelete && patientId && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Patient"
                        onClick={() =>
                          alert(
                            "Patient deletion will be implemented next."
                          )
                        }
                      >
                        <FaTrash size={17} />
                      </button>
                    )}

                  </div>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}

export default PatientTable;