function PatientTable({ patients }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>

            <th className="p-4">ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Disease</th>
            <th>Risk</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {patients.map((patient) => (

            <tr
              key={patient.id}
              className="border-b hover:bg-slate-100"
            >

              <td className="p-4">{patient.id}</td>

              <td>{patient.name}</td>

              <td>{patient.age}</td>

              <td>{patient.disease}</td>

              <td>{patient.risk}</td>

              <td>{patient.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PatientTable;