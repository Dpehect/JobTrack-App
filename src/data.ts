import type {Application,Stage} from './types';
export const stages:{id:Stage;label:string;dot:string}[]=[
 {id:'saved',label:'Saved',dot:'#8d8d98'},{id:'applied',label:'Applied',dot:'#7c9cff'},
 {id:'screening',label:'Screening',dot:'#b78aff'},{id:'interview',label:'Interview',dot:'#f5b85c'},
 {id:'offer',label:'Offer',dot:'#66d19e'},{id:'accepted',label:'Accepted',dot:'#35c983'},
 {id:'rejected',label:'Closed',dot:'#ee7777'}];
export const seed:Application[]=[
 {id:'1',company:'Northstar Labs',role:'Full-stack Developer',location:'Amsterdam',workMode:'Remote',stage:'interview',source:'LinkedIn',url:'https://linkedin.com',appliedAt:'2026-08-01',favorite:true,createdAt:'2026-08-01',updatedAt:'2026-08-03'},
 {id:'2',company:'Linear House',role:'Frontend Engineer',location:'Berlin',workMode:'Hybrid',stage:'screening',source:'Company site',url:'',appliedAt:'2026-08-02',favorite:false,createdAt:'2026-08-02',updatedAt:'2026-08-02'},
 {id:'3',company:'Softframe',role:'Product Engineer',location:'Lisbon',workMode:'Remote',stage:'applied',source:'Wellfound',url:'',appliedAt:'2026-08-03',favorite:false,createdAt:'2026-08-03',updatedAt:'2026-08-03'},
 {id:'4',company:'Meridian',role:'React Developer',location:'London',workMode:'Remote',stage:'saved',source:'LinkedIn',url:'',appliedAt:'2026-08-03',favorite:true,createdAt:'2026-08-03',updatedAt:'2026-08-03'},
 {id:'5',company:'Atlas Systems',role:'Software Engineer',location:'Istanbul',workMode:'On-site',stage:'offer',source:'Referral',url:'',appliedAt:'2026-07-25',favorite:false,createdAt:'2026-07-25',updatedAt:'2026-08-03'}];
