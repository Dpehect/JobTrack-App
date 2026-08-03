import {invoke} from '@tauri-apps/api/core';
import type {Application} from './types';
import {seed} from './data';
const KEY='jobtrack-demo-applications';
const tauri=()=>typeof window!=='undefined'&&'__TAURI_INTERNALS__' in window;
export async function listApplications():Promise<Application[]>{
 if(tauri()) return invoke<Application[]>('list_applications');
 const saved=localStorage.getItem(KEY); if(saved) return JSON.parse(saved);
 localStorage.setItem(KEY,JSON.stringify(seed)); return seed;
}
export async function saveApplication(app:Application){
 if(tauri()) return invoke('save_application',{application:app});
 const all=await listApplications(); const next=[app,...all.filter(x=>x.id!==app.id)]; localStorage.setItem(KEY,JSON.stringify(next));
}
export async function removeApplication(id:string){
 if(tauri()) return invoke('delete_application',{id});
 localStorage.setItem(KEY,JSON.stringify((await listApplications()).filter(x=>x.id!==id)));
}
