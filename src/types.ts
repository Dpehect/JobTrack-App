export type Stage='saved'|'applied'|'screening'|'interview'|'offer'|'accepted'|'rejected';
export type WorkMode='Remote'|'Hybrid'|'On-site';
export interface Application {id:string;company:string;role:string;location:string;workMode:WorkMode;stage:Stage;source:string;url:string;appliedAt:string;salary?:string;description?:string;notes?:string;favorite:boolean;createdAt:string;updatedAt:string;}
