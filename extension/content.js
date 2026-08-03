function first(selectors){for(const s of selectors){const el=document.querySelector(s);if(el?.textContent?.trim())return el.textContent.trim()}return''}
function meta(name){return document.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.content||''}
function capture(){
 const linked=location.hostname.includes('linkedin');
 const role=first(linked?['h1','.job-details-jobs-unified-top-card__job-title']:['h1','[data-testid="jobsearch-JobInfoHeader-title"]'])||meta('og:title').split('|')[0];
 const company=first(linked?['.job-details-jobs-unified-top-card__company-name','[class*="company-name"]']:['[data-company-name="true"]','.jobsearch-InlineCompanyRating-companyHeader'])||meta('og:site_name');
 const locationText=first(['.job-details-jobs-unified-top-card__primary-description-container','.jobsearch-JobInfoHeader-subtitle','[class*="location"]']);
 return{company,role,location:locationText.slice(0,120),url:location.href,source:location.hostname.replace('www.',''),description:first(['.jobs-description__content','.jobsearch-jobDescriptionText','[class*="jobDescription"]']).slice(0,12000)};
}
chrome.runtime.onMessage.addListener((msg,_sender,reply)=>{if(msg==='capture')reply(capture())});
