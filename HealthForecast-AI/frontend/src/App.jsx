import {useEffect,useState} from "react";
import {Link,Navigate,Route,Routes,useNavigate} from "react-router-dom";
import {Activity,BrainCircuit,FileText,LogOut,ShieldCheck,Users,Database,ClipboardList,Settings,BarChart3,Stethoscope,HeartPulse,Download,Eye} from "lucide-react";
import api from "./services/api";

const roles={
 doctor:"Doctor",
 hospital_administrator:"Hospital Administrator",
 healthcare_researcher:"Healthcare Researcher",
 system_administrator:"System Administrator"
};
const allRoles=Object.entries(roles);

function Login({onLogin}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const navigate=useNavigate();
 async function submit(e){e.preventDefault();setError("");try{const r=await api.post("/auth/login",{email,password});localStorage.setItem("hf_token",r.data.access_token);localStorage.setItem("hf_user",JSON.stringify(r.data.user));onLogin(r.data.user);navigate("/");}catch(err){setError(err.response?.data?.detail||"Login failed");}}
 return <div className="login"><form className="login-card" onSubmit={submit}>
  <h1><Activity/> HealthForecast AI</h1><p>Hospital Readmission & Patient Risk Intelligence</p>
  <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Enter your email" autoComplete="username" required/>
  <label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Enter your password" autoComplete="current-password" required/>
  {error&&<div className="err">{error}</div>}<button>Sign in</button>
  <Link className="auth-link" to="/register">Create a Doctor account</Link>
 </form></div>;
}

function Register(){
 const navigate=useNavigate();const [form,setForm]=useState({full_name:"",email:"",password:"",confirm_password:"",hospital:"Demo Hospital"});const [error,setError]=useState("");const [message,setMessage]=useState("");
 async function submit(e){e.preventDefault();setError("");if(form.password!==form.confirm_password)return setError("Passwords do not match");if(form.password.length<8)return setError("Password must contain at least 8 characters");try{await api.post("/auth/register",{full_name:form.full_name,email:form.email,password:form.password,hospital:form.hospital});setMessage("Registration successful. Your role is Doctor.");setTimeout(()=>navigate("/"),800);}catch(err){setError(err.response?.data?.detail||"Registration failed");}}
 return <div className="login"><form className="login-card" onSubmit={submit}><h1><Activity/> Create Account</h1><p>Public registration creates Doctor accounts only.</p>
  <label>Full name</label><input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/>
  <label>Email</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
  <label>Hospital</label><input required value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})}/>
  <label>Password</label><input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
  <label>Confirm password</label><input required type="password" value={form.confirm_password} onChange={e=>setForm({...form,confirm_password:e.target.value})}/>
  {error&&<div className="err">{error}</div>}{message&&<div className="success">{message}</div>}<button>Register</button><Link className="auth-link" to="/">Back to login</Link>
 </form></div>;
}

function Layout({user,logout,children}){
 const r=user.role, nav=[];
 if(r==="doctor") nav.push(["/","Dashboard"],["/patients","Patient Records"],["/prediction","Risk Prediction"],["/treatments","Treatment Effectiveness"],["/analysis","Treatment Reports"],["/precautions","Clinical Decision Support"]);
 if(r==="hospital_administrator") nav.push(["/","Hospital Dashboard"],["/patients","Patient Outcomes"],["/prediction","Readmission Forecasts"],["/analysis","Treatment Effectiveness"],["/hospital-analytics","Hospital Analytics"],["/precautions","Operational Care Support"]);
 if(r==="healthcare_researcher") nav.push(["/","Research Dashboard"],["/patients","Anonymized Dataset"],["/prediction","Risk Prediction"],["/analysis","Treatment Analysis"],["/model","AI Model Results"],["/research-export","Research Dataset Export"],["/population","Population Health"]);
 if(r==="system_administrator") nav.push(["/","System Dashboard"],["/patients","Dataset Predictions"],["/prediction","Risk Prediction"],["/users","User & Role Management"],["/dataset-admin","Dataset Management"],["/audit","Activity & Audit Logs"],["/settings","System Settings"]);
 return <div className="shell"><aside><h2><Activity/> HealthForecast</h2><span>{roles[r]}</span><nav>{nav.map(([to,label])=><Link key={to} to={to}>{label}</Link>)}</nav><button onClick={logout}><LogOut/> Logout</button></aside><main><header><b>HealthForecast AI</b><span>{user.full_name} · {roles[r]}</span></header><section>{children}</section></main></div>;
}

function StatsCards({stats}){
 if(!stats) return <div className="panel"><p>Loading dashboard analytics...</p></div>;
 const cards=[
  ["Dataset encounters",(stats.total_patients??0).toLocaleString()],
  ["Predictions ready",(stats.patients_with_predictions??0).toLocaleString()],
  ["High-risk patients",(stats.high_risk_patients??0).toLocaleString()],
  ["Early readmission rate",`${stats.early_readmission_rate??0}%`],
  ["Avg. readmission probability",`${((stats.average_readmission_probability??0)*100).toFixed(1)}%`],
  ["Treatment analysis encounters",(stats.total_patients??0).toLocaleString()]
 ];
 return <div className="cards">{cards.map(([label,value])=><div className="card" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>;
}

function RiskSummary({stats}){
 if(!stats) return null;
 const d=stats.risk_distribution||{};
 return <div className="panel"><h2>Readmission Risk Analysis</h2><div className="cards">
  <div className="card"><small>Low Risk</small><strong>{(d.Low??0).toLocaleString()}</strong></div>
  <div className="card"><small>Medium Risk</small><strong>{(d.Medium??0).toLocaleString()}</strong></div>
  <div className="card"><small>High Risk</small><strong>{(d.High??0).toLocaleString()}</strong></div>
  <div className="card"><small>Early Readmissions (&lt;30 days)</small><strong>{(stats.early_readmission_count??0).toLocaleString()}</strong></div>
 </div><p>Risk values are generated from the trained readmission model for the uploaded Diabetes 130-US Hospitals encounters. Treatment analysis uses the historical medication fields in the supplied dataset.</p></div>;
}

function Dashboard({user}){
 const [stats,setStats]=useState(null); const [error,setError]=useState("");
 useEffect(()=>{api.get("/analytics/dashboard").then(r=>setStats(r.data)).catch(e=>setError(e.response?.data?.detail||"Unable to load dashboard analytics"))},[]);
 const r=user.role;
 if(r==="system_administrator") return <SystemDashboard/>;
 const title=r==="hospital_administrator"?"Hospital Administrator Dashboard":r==="healthcare_researcher"?"Healthcare Research Dashboard":"Doctor Dashboard";
 const subtitle=r==="hospital_administrator"?"Hospital-wide operational monitoring and outcome management.":r==="healthcare_researcher"?"Aggregated and anonymized healthcare analytics.":"Patient risk monitoring and clinical decision support.";
 return <><h1>{title}</h1><p>{subtitle}</p>{error&&<div className="err">{error}</div>}<StatsCards stats={stats}/><RiskSummary stats={stats}/><div className="panel"><h2>Available responsibilities</h2><ul>{r==="hospital_administrator"?<><li>Hospital-wide patient outcome analytics</li><li>Readmission statistics and healthcare performance reports</li><li>Treatment effectiveness and operational monitoring</li><li>Population-level precautions and care support</li></>:r==="healthcare_researcher"?<><li>Population health and readmission trend analysis</li><li>Anonymized dataset analysis and export</li><li>Treatment effectiveness research</li><li>AI model results and analytical reports</li></>:<><li>Assigned patient records and medical history</li><li>Readmission probability and high-risk identification</li><li>Treatment effectiveness review</li><li>Clinical decision support and follow-up planning</li></>}</ul></div></>;
}

function SystemDashboard(){
 const [users,setUsers]=useState([]),[dataset,setDataset]=useState(null),[error,setError]=useState("");
 useEffect(()=>{Promise.all([api.get("/users"),api.get("/admin/dataset-status")]).then(([u,d])=>{setUsers(u.data);setDataset(d.data)}).catch(e=>setError(e.response?.data?.detail||"Unable to load system data"))},[]);
 return <><h1>System Administrator Dashboard</h1><p>Platform administration, security, governance and access management.</p>{error&&<div className="err">{error}</div>}
 <div className="cards"><div className="card"><Users/><small>Total users</small><strong>{users.length}</strong></div><div className="card"><Database/><small>Dataset encounters</small><strong>{dataset?.encounters?.toLocaleString()??"-"}</strong></div><div className="card"><ShieldCheck/><small>Access control</small><strong>RBAC Active</strong></div><div className="card"><ClipboardList/><small>Audit logging</small><strong>Enabled</strong></div></div>
 <div className="panel"><h2>System Administrator Actions</h2><div className="admin-actions">
 {[[Users,"User & Role Management","Create users, assign roles and control access.","/users"],[Database,"Dataset Management","Manage the supplied Diabetes 130-US Hospitals dataset.","/dataset-admin"],[ClipboardList,"Activity & Audit Logs","Monitor platform activity and security events.","/audit"],[Settings,"System Settings","Review platform configuration and governance settings.","/settings"]].map(([I,t,d,to])=><Link className="admin-action" key={to} to={to}><I/><div><b>{t}</b><small>{d}</small></div></Link>)}</div></div>
 </>;
}

function Patients({user}){
 const [patients,setPatients]=useState([]),[result,setResult]=useState(null),[page,setPage]=useState(0),[error,setError]=useState("");
 const load=()=>api.get(`/patients?skip=${page*100}&limit=100`).then(r=>setPatients(r.data)).catch(e=>setError(e.response?.data?.detail||"Unable to load patient data"));
 useEffect(()=>{ load(); },[page]);
 async function predict(id){try{setError("");const r=await api.post(`/predictions/patients/${id}`);setResult(r.data);load()}catch(e){setError(e.response?.data?.detail||"Prediction failed")}}
 const researcher=user.role==="healthcare_researcher";
 return <><h1>{researcher?"Anonymized Dataset with Risk Predictions":"Patient Records & Risk Predictions"}</h1>{error&&<div className="err">{error}</div>}<p>Predictions are generated from the trained Diabetes 130-US Hospitals readmission model and are shared across authorized user accounts. Researcher patient details remain anonymized.</p><div className="panel"><table><thead><tr><th>Record</th><th>Patient</th><th>Age</th><th>Gender</th><th>Diagnosis</th><th>Actual readmission</th><th>Predicted risk</th><th>Readmission probability</th><th>Action</th></tr></thead><tbody>{patients.map((p,i)=><tr key={p.id}><td>{researcher?`Record ${page*100+i+1}`:p.dataset_encounter_id||p.mrn}</td><td>{researcher?`Anonymized patient ${page*100+i+1}`:p.full_name}</td><td>{p.age}</td><td>{p.gender}</td><td>{p.diagnosis}</td><td>{p.readmitted||"-"}</td><td><b>{p.predicted_risk_category||"-"}</b></td><td>{p.predicted_readmission_probability!=null?`${(p.predicted_readmission_probability*100).toFixed(1)}%`:'-'}</td><td><button onClick={()=>predict(p.id)}>Recalculate</button></td></tr>)}</tbody></table><button onClick={()=>setPage(Math.max(0,page-1))}>Previous</button> <button onClick={()=>setPage(page+1)}>Next</button><span> Page {page+1}</span>{result&&<div className="result"><b>Selected patient:</b> Readmission probability {(result.readmission_probability*100).toFixed(1)}% — <b>{result.risk_category} risk</b><p>Model: {result.model_version}</p></div>}</div></>;
}

function Prediction(){
 const [features,setFeatures]=useState({age:65,time_in_hospital:5,num_lab_procedures:40,num_procedures:1,num_medications:10,number_outpatient:1,number_emergency:1,number_inpatient:2,number_diagnoses:6}),[result,setResult]=useState(null),[error,setError]=useState("");
 async function submit(e){e.preventDefault();setError("");try{setResult((await api.post("/predictions/predict",features)).data)}catch(err){setError(err.response?.data?.detail||"Prediction failed")}}
 return <><h1>Risk Prediction & Readmission Forecasting</h1><div className="panel"><p>Predicts early readmission (&lt;30 days) using the trained model.</p><form className="form" onSubmit={submit}>{Object.entries(features).map(([k,v])=><label key={k}>{k.replaceAll("_"," ")}<input type="number" min="0" value={v} onChange={e=>setFeatures({...features,[k]:Number(e.target.value)})}/></label>)}<button>Calculate Prediction</button></form>{error&&<div className="err">{error}</div>}{result&&<div className="result"><h2>{(result.readmission_probability*100).toFixed(1)}% — {result.risk_category} Risk</h2><p>Model: {result.model_version}</p><p>Use as clinical decision support only.</p></div>}</div></>;
}

function Treatments(){
 const [patients,setPatients]=useState([]),[message,setMessage]=useState(""),[error,setError]=useState("");
 const [form,setForm]=useState({patient_id:"",treatment_name:"Care Plan Review",medication:"",start_date:new Date().toISOString().slice(0,10),outcome:"Ongoing",recovery_score:50,effectiveness_score:50,notes:""});
 useEffect(()=>{api.get("/patients?limit=100").then(r=>setPatients(r.data))},[]);
 async function submit(e){e.preventDefault();try{await api.post("/treatments",{...form,patient_id:Number(form.patient_id),recovery_score:Number(form.recovery_score),effectiveness_score:Number(form.effectiveness_score)});setMessage("Treatment saved successfully.")}catch(err){setError(err.response?.data?.detail||"Unable to save treatment")}}
 return <><h1>Treatment Effectiveness</h1><div className="panel"><form className="form" onSubmit={submit}><label>Patient<select required value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.dataset_encounter_id})</option>)}</select></label><label>Treatment<input required value={form.treatment_name} onChange={e=>setForm({...form,treatment_name:e.target.value})}/></label><label>Medication<input value={form.medication} onChange={e=>setForm({...form,medication:e.target.value})}/></label><label>Effectiveness 0-100<input type="number" min="0" max="100" value={form.effectiveness_score} onChange={e=>setForm({...form,effectiveness_score:e.target.value})}/></label><label>Outcome<select value={form.outcome} onChange={e=>setForm({...form,outcome:e.target.value})}><option>Ongoing</option><option>Improved</option><option>No Change</option><option>Adverse</option></select></label><button>Save Treatment</button></form>{error&&<div className="err">{error}</div>}{message&&<div className="success">{message}</div>}</div></>;
}

function Analysis(){
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{api.get("/analytics/treatment-analysis").then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.detail||"Unable to load analysis"))},[]);
 async function download(){const r=await api.get("/reports/treatment-analysis.pdf",{responseType:"blob"});const u=URL.createObjectURL(r.data),a=document.createElement("a");a.href=u;a.download="treatment_analysis_report.pdf";a.click();URL.revokeObjectURL(u)}
 return <><h1>Treatment Effectiveness Analysis</h1><div className="panel">{error&&<div className="err">{error}</div>}{data&&<><p><b>{data.total_encounters.toLocaleString()}</b> encounters analyzed.</p><button onClick={download}><FileText/> Download Treatment Analysis Report</button><h2>Medication-use associations</h2><table><thead><tr><th>Treatment</th><th>Encounters</th><th>Early readmissions</th><th>Rate</th></tr></thead><tbody>{data.medications.slice(0,15).map(x=><tr key={x.treatment}><td>{x.treatment}</td><td>{x.encounters.toLocaleString()}</td><td>{x.early_readmissions.toLocaleString()}</td><td>{x.early_readmission_rate}%</td></tr>)}</tbody></table><h2>Medication change</h2><p>Changed: {data.medication_change.changed.encounters.toLocaleString()} ({data.medication_change.changed.rate}%).</p><p>Unchanged: {data.medication_change.unchanged.encounters.toLocaleString()} ({data.medication_change.unchanged.rate}%).</p><h2>Insulin</h2>{Object.entries(data.insulin).map(([k,v])=><p key={k}>{k}: {v.encounters.toLocaleString()} encounters, {v.rate}% early-readmission rate.</p>)}<small>{data.disclaimer}</small></>}</div></>;
}

function ModelMetrics({ user }) {
    const [m, setM] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [training, setTraining] = useState(false);

    const load = () => {
        api.get("/model/metrics")
            .then((r) => {
                setM(r.data);
                setError("");
            })
            .catch((e) => {
                setError(
                    e.response?.data?.detail || "Unable to load metrics"
                );
            });
    };

    // Load model metrics when the component is opened
    useEffect(() => {
        load();
    }, []);

    async function retrain() {
        setTraining(true);
        setError("");
        setMessage("");

        try {
            const r = await api.post("/model/train");

            setMessage(r.data.message || "Model trained successfully");

            // Reload metrics after training
            load();
        } catch (e) {
            setError(
                e.response?.data?.detail || "Training failed"
            );
        } finally {
            setTraining(false);
        }
    }

    return (
        <>
            <h1>AI Model Management</h1>

            <div className="panel">

                {error && (
                    <div className="err">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="success">
                        {message}
                    </div>
                )}

                {m && (
                    <>
                        <p>
                            <b>Random Forest</b> trained on{" "}
                            {m.dataset_rows?.toLocaleString()} encounters.
                            Target: early readmission (&lt;30 days).
                        </p>

                        <div className="cards">

                            {[
                                ["Accuracy", m.accuracy],
                                ["Precision", m.precision],
                                ["Recall", m.recall],
                                ["F1", m.f1],
                                ["ROC-AUC", m.roc_auc],
                            ].map(([k, v]) => (
                                <div className="card" key={k}>
                                    <small>{k}</small>

                                    <strong>
                                        {typeof v === "number"
                                            ? `${(v * 100).toFixed(2)}%`
                                            : "N/A"}
                                    </strong>
                                </div>
                            ))}

                        </div>

                        {user?.role === "system_administrator" && (
                            <button
                                onClick={retrain}
                                disabled={training}
                            >
                                {training
                                    ? "Training..."
                                    : "Retrain Model"}
                            </button>
                        )}

                        <h2>Evaluation</h2>

                        <pre>
                            {JSON.stringify(
                                m.confusion_matrix,
                                null,
                                2
                            )}
                        </pre>

                        <p>
                            {m.note}
                        </p>
                    </>
                )}

            </div>
        </>
    );
}

function UsersPage(){
 const [users,setUsers]=useState([]),[form,setForm]=useState({full_name:"",email:"",password:"",role:"doctor",hospital:"Demo Hospital"}),[msg,setMsg]=useState(""),[error,setError]=useState("");
 const load=()=>api.get("/users").then(r=>setUsers(r.data)).catch(e=>setError(e.response?.data?.detail||"Unable to load users"));useEffect(()=>{ load(); },[]);
 async function create(e){e.preventDefault();try{await api.post("/users",form);setMsg("User created.");setForm({...form,full_name:"",email:"",password:""});load()}catch(err){setError(err.response?.data?.detail||"Unable to create user")}}
 return <><h1>User & Role Management</h1><div className="panel"><form className="form" onSubmit={create}><label>Name<input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label><label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{allRoles.map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Hospital<input required value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})}/></label><button>Create User</button></form>{error&&<div className="err">{error}</div>}{msg&&<div className="success">{msg}</div>}</div><div className="panel"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>{roles[u.role]||u.role}</td></tr>)}</tbody></table></div></>;
}

function AdminPage({type}){
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{const url=type==="audit"?"/admin/audit-logs":"/admin/dataset-status";api.get(url).then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.detail||"Unable to load"))},[type]);
 if(type==="audit")return <><h1>Activity & Audit Logs</h1><div className="panel">{error&&<div className="err">{error}</div>}<table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>{(data||[]).map(x=><tr key={x.id}><td>{x.created_at}</td><td>{x.user_id}</td><td>{x.action}</td><td>{x.details}</td></tr>)}</tbody></table></div></>;
 return <><h1>Dataset Management</h1><div className="panel">{error&&<div className="err">{error}</div>}<h2>{data?.dataset||"Diabetes 130-US Hospitals"}</h2><p>Source files: diabetic_data.csv + IDS_mapping.csv</p><p><b>Imported encounters:</b> {data?.encounters?.toLocaleString()||"-"}</p><p>System administration can monitor the dataset integration used by the prediction and analytics modules.</p></div></>;
}

function ResearchExport(){
 async function download(){const r=await api.get("/admin/research-export.csv",{responseType:"blob"});const u=URL.createObjectURL(r.data),a=document.createElement("a");a.href=u;a.download="healthforecast_research_dataset.csv";a.click();URL.revokeObjectURL(u)}
 return <><h1>Research Dataset Export</h1><div className="panel"><p>Export contains anonymized/limited analytical fields from the supplied historical dataset.</p><button onClick={download}><Download/> Download Research Dataset</button></div></>;
}
function SimpleInfo({title,children}){return <><h1>{title}</h1><div className="panel">{children}</div></>}

function HospitalAnalytics(){
 async function download(){const r=await api.get("/admin/hospital-analytics.csv",{responseType:"blob"});const u=URL.createObjectURL(r.data),a=document.createElement("a");a.href=u;a.download="hospital_analytics.csv";a.click();URL.revokeObjectURL(u)}
 return <SimpleInfo title="Hospital Analytics"><p>Hospital-wide patient outcome analytics, readmission statistics, department monitoring, treatment effectiveness metrics and operational reporting.</p><button onClick={download}><Download/> Export Hospital Analytics</button></SimpleInfo>;
}

function Precautions(){return <SimpleInfo title="Clinical Decision Support & Precautions"><ul><li>Use predictions only as clinical decision support, never as diagnosis or automatic treatment prescription.</li><li>Confirm medication reconciliation, adherence, allergies and interactions with qualified clinicians.</li><li>Arrange timely follow-up for high-risk patients and prior utilization.</li><li>Review glucose/A1C, comorbidities and warning signs using hospital protocols.</li><li>Historical treatment associations do not prove causation.</li><li>Protect patient privacy and validate the model before real-world deployment.</li></ul></SimpleInfo>}

function Protected({user,allowed,children}){return allowed.includes(user.role)?children:<Navigate to="/" replace/>}
export default function App(){
 const [user,setUser]=useState(null);
 // Always start with the login page when the application is opened/refreshed.
 // Authentication is established only after the user submits the login form.
 useEffect(()=>{localStorage.removeItem("hf_token");localStorage.removeItem("hf_user");},[]);
 function logout(){localStorage.removeItem("hf_token");localStorage.removeItem("hf_user");setUser(null)}
 if(!user)return <Routes><Route path="/register" element={<Register/>}/><Route path="*" element={<Login onLogin={setUser}/>}/></Routes>;
 const r=user.role;
 return <Layout user={user} logout={logout}><Routes>
  <Route path="/" element={<Dashboard user={user}/>}/>
  <Route path="/patients" element={<Protected user={user} allowed={["doctor","hospital_administrator","healthcare_researcher","system_administrator"]}><Patients user={user}/></Protected>}/>
  <Route path="/prediction" element={<Protected user={user} allowed={["doctor","hospital_administrator","healthcare_researcher","system_administrator"]}><Prediction/></Protected>}/>
  <Route path="/treatments" element={<Protected user={user} allowed={["doctor","hospital_administrator"]}><Treatments/></Protected>}/>
  <Route path="/analysis" element={<Protected user={user} allowed={["doctor","hospital_administrator","healthcare_researcher","system_administrator"]}><Analysis/></Protected>}/>
  <Route path="/precautions" element={<Protected user={user} allowed={["doctor","hospital_administrator"]}><Precautions/></Protected>}/>
  <Route path="/model" element={<Protected user={user} allowed={["healthcare_researcher"]}><ModelMetrics user={user}/></Protected>}/>
  <Route path="/users" element={<Protected user={user} allowed={["system_administrator"]}><UsersPage/></Protected>}/>
  <Route path="/dataset-admin" element={<Protected user={user} allowed={["system_administrator"]}><AdminPage type="dataset"/></Protected>}/>
  <Route path="/audit" element={<Protected user={user} allowed={["system_administrator"]}><AdminPage type="audit"/></Protected>}/>
  <Route path="/research-export" element={<Protected user={user} allowed={["healthcare_researcher","system_administrator"]}><ResearchExport/></Protected>}/>
  <Route path="/hospital-analytics" element={<Protected user={user} allowed={["hospital_administrator"]}><HospitalAnalytics/></Protected>}/>
  <Route path="/population" element={<Protected user={user} allowed={["healthcare_researcher","hospital_administrator"]}><SimpleInfo title="Population Health Reports"><p>Aggregated population-level statistics and readmission/treatment trends are provided without exposing individual clinical decisions.</p></SimpleInfo></Protected>}/>
  <Route path="/settings" element={<Protected user={user} allowed={["system_administrator"]}><SimpleInfo title="System Settings"><ul><li>Authentication and RBAC enabled</li><li>Database: SQLite by default for simple local execution</li><li>Dataset: Diabetes 130-US Hospitals</li><li>Model: Random Forest early-readmission predictor</li><li>API: FastAPI</li></ul></SimpleInfo></Protected>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></Layout>;
}