function StatCard({ icon, value, title }) {

    return (

        <div className="card">

            <div className="card-icon">

                {icon}

            </div>

            <h2>{value}</h2>

            <p>{title}</p>

        </div>

    );

}

export default StatCard;