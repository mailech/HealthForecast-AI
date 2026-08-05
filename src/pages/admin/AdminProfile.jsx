import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/admin-profile.css";

function AdminProfile(){

    return(

        <AdminLayout>

            <div className="profile-page">

                <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Admin"
                />

                <h1>Hospital Administrator</h1>

                <p>Email : admin@healthforecast.com</p>

                <p>Phone : +91 9876543210</p>

                <p>Role : System Administrator</p>

                <button>Edit Profile</button>

            </div>

        </AdminLayout>

    );

}

export default AdminProfile;