use rusqlite::{params,Connection};
use serde::{Deserialize,Serialize};
use std::{fs,path::PathBuf,sync::Mutex};
use std::io::Read;
use tauri::{Manager,State};
use tiny_http::{Header,Method,Response,Server,StatusCode};

struct Db(Mutex<Connection>);

#[derive(Debug,Serialize,Deserialize)]
#[serde(rename_all="camelCase")]
struct Application{
 id:String,company:String,role:String,location:String,work_mode:String,stage:String,
 source:String,url:String,applied_at:String,salary:Option<String>,description:Option<String>,
 notes:Option<String>,favorite:bool,created_at:String,updated_at:String
}

#[derive(Deserialize)]
struct Capture{company:String,role:String,location:Option<String>,url:Option<String>,source:Option<String>,description:Option<String>,stage:Option<String>}

fn open_db(path:PathBuf)->Connection{
 if let Some(parent)=path.parent(){fs::create_dir_all(parent).expect("create app data directory");}
 let conn=Connection::open(path).expect("open local database");
 conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS applications(
 id TEXT PRIMARY KEY, company TEXT NOT NULL, role TEXT NOT NULL, location TEXT NOT NULL DEFAULT '',
 work_mode TEXT NOT NULL DEFAULT 'Remote', stage TEXT NOT NULL DEFAULT 'saved', source TEXT NOT NULL DEFAULT '',
 url TEXT NOT NULL DEFAULT '', applied_at TEXT NOT NULL, salary TEXT, description TEXT, notes TEXT,
 favorite INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_app_stage ON applications(stage);
 CREATE INDEX IF NOT EXISTS idx_app_updated ON applications(updated_at DESC);
 CREATE TABLE IF NOT EXISTS activity_history(id INTEGER PRIMARY KEY AUTOINCREMENT,application_id TEXT NOT NULL,event TEXT NOT NULL,created_at TEXT NOT NULL);")
 .expect("initialize schema");conn
}

fn start_extension_bridge(path:PathBuf){std::thread::spawn(move||{
 let Ok(server)=Server::http("127.0.0.1:47821") else{return};
 for mut request in server.incoming_requests(){
  let origin=Header::from_bytes("Access-Control-Allow-Origin","*").unwrap();
  if request.method()==&Method::Options{let _=request.respond(Response::empty(204).with_header(origin));continue}
  if request.method()!=&Method::Post||request.url()!="/applications"{let _=request.respond(Response::empty(404).with_header(origin));continue}
  let mut body=String::new();if request.as_reader().read_to_string(&mut body).is_err(){let _=request.respond(Response::empty(400).with_header(origin));continue}
  let Ok(item)=serde_json::from_str::<Capture>(&body) else{let _=request.respond(Response::empty(400).with_header(origin));continue};
  if item.company.trim().is_empty()||item.role.trim().is_empty(){let _=request.respond(Response::empty(422).with_header(origin));continue}
  let conn=open_db(path.clone());let url=item.url.unwrap_or_default();
  let duplicate:bool=conn.query_row("SELECT EXISTS(SELECT 1 FROM applications WHERE url<>'' AND url=?1)",[&url],|r|r.get(0)).unwrap_or(false);
  if duplicate{let _=request.respond(Response::empty(StatusCode(409)).with_header(origin));continue}
  let now=chrono::Utc::now().format("%Y-%m-%d").to_string();
  let _=conn.execute("INSERT INTO applications(id,company,role,location,work_mode,stage,source,url,applied_at,description,favorite,created_at,updated_at) VALUES(?1,?2,?3,?4,'Remote',?5,?6,?7,?8,?9,0,?8,?8)",params![uuid::Uuid::new_v4().to_string(),item.company,item.role,item.location.unwrap_or_default(),item.stage.unwrap_or_else(||"saved".into()),item.source.unwrap_or_default(),url,now,item.description]);
  let _=request.respond(Response::from_string("{\"ok\":true}").with_status_code(201).with_header(origin).with_header(Header::from_bytes("Content-Type","application/json").unwrap()));
 }
});}

#[tauri::command]
fn list_applications(db:State<Db>)->Result<Vec<Application>,String>{
 let conn=db.0.lock().map_err(|e|e.to_string())?;
 let mut stmt=conn.prepare("SELECT id,company,role,location,work_mode,stage,source,url,applied_at,salary,description,notes,favorite,created_at,updated_at FROM applications ORDER BY updated_at DESC").map_err(|e|e.to_string())?;
 let rows=stmt.query_map([],|r|Ok(Application{id:r.get(0)?,company:r.get(1)?,role:r.get(2)?,location:r.get(3)?,work_mode:r.get(4)?,stage:r.get(5)?,source:r.get(6)?,url:r.get(7)?,applied_at:r.get(8)?,salary:r.get(9)?,description:r.get(10)?,notes:r.get(11)?,favorite:r.get::<_,i64>(12)?==1,created_at:r.get(13)?,updated_at:r.get(14)?})).map_err(|e|e.to_string())?;
 rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}

#[tauri::command]
fn save_application(db:State<Db>,application:Application)->Result<(),String>{
 if application.company.trim().is_empty()||application.role.trim().is_empty(){return Err("Company and role are required".into())}
 let conn=db.0.lock().map_err(|e|e.to_string())?;
 conn.execute("INSERT INTO applications(id,company,role,location,work_mode,stage,source,url,applied_at,salary,description,notes,favorite,created_at,updated_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15) ON CONFLICT(id) DO UPDATE SET company=excluded.company,role=excluded.role,location=excluded.location,work_mode=excluded.work_mode,stage=excluded.stage,source=excluded.source,url=excluded.url,applied_at=excluded.applied_at,salary=excluded.salary,description=excluded.description,notes=excluded.notes,favorite=excluded.favorite,updated_at=excluded.updated_at",
 params![application.id,application.company,application.role,application.location,application.work_mode,application.stage,application.source,application.url,application.applied_at,application.salary,application.description,application.notes,application.favorite as i32,application.created_at,application.updated_at]).map_err(|e|e.to_string())?;Ok(())
}

#[tauri::command]
fn delete_application(db:State<Db>,id:String)->Result<(),String>{let conn=db.0.lock().map_err(|e|e.to_string())?;conn.execute("DELETE FROM applications WHERE id=?1",[id]).map_err(|e|e.to_string())?;Ok(())}

#[cfg_attr(mobile,tauri::mobile_entry_point)]
pub fn run(){
 tauri::Builder::default().plugin(tauri_plugin_opener::init()).setup(|app|{
  let path=app.path().app_data_dir().expect("app data path").join("jobtrack.db");
  app.manage(Db(Mutex::new(open_db(path.clone()))));start_extension_bridge(path);Ok(())
 }).invoke_handler(tauri::generate_handler![list_applications,save_application,delete_application]).run(tauri::generate_context!()).expect("run JobTrack");
}
