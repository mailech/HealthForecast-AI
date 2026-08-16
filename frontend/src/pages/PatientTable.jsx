import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function PatientTable({ patients }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>

            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Age</th>
            <th className="p-4 text-left">Disease</th>
            <th className="p-4 text-left">Risk</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>

          </tr>

        </thead>

        <tbody>

          {patients.map((patient) => (

            <tr
              key={patient.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-4">{patient.id}</td>

              <td className="p-4 font-semibold">
                {patient.name}
              </td>

              <td className="p-4">{patient.age}</td>

              <td className="p-4">{patient.disease}</td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    patient.risk === "High"
                      ? "bg-red-100 text-red-600"
                      : patient.risk === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {patient.risk}
                </span>

              </td>

              <td className="p-4">
                {patient.status}
              </td>

              <td className="p-4">

                <div className="flex justify-center gap-4">

                  <Link
                    to={`/patients/${patient.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </Link>

                  <button className="text-green-600 hover:text-green-800">
                    <FaEdit />
                  </button>

                  <button className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PatientTable;