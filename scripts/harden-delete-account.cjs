module.exports=function(source){
 const start=source.indexOf('reactExports.useEffect('),end=source.indexOf('const Ht =',start);
 if(start<0||end<0)throw Error('Deletion loader boundaries missing');
 const loader=`const [deletionCheck,setDeletionCheck]=reactExports.useState({userId:null,status:'idle'}),[deletionAttempt,setDeletionAttempt]=reactExports.useState(0),deletionSubmitting=reactExports.useRef(false);
 reactExports.useEffect(()=>{let active=true;at(false);Lt(false);qt(false);if(!o){setDeletionCheck({userId:null,status:'idle'});return()=>{active=false}}const userId=o.id;setDeletionCheck({userId,status:'loading'});let timer;Promise.race([Promise.resolve(supabase.from('account_deletion_requests').select('id').eq('user_id',userId).eq('status','pending').maybeSingle()),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Timeout')),12000)})]).then(({data,error})=>{if(error)throw error;if(active){qt(Boolean(data));setDeletionCheck({userId,status:'ready'})}}).catch(()=>{if(active)setDeletionCheck({userId,status:'error'})}).finally(()=>clearTimeout(timer));return()=>{active=false;clearTimeout(timer)}},[o?.id,deletionAttempt]); `;
 source=source.slice(0,start)+loader+source.slice(end);
 source=source.replace('if (o) {','if (o && deletionCheck.userId===o.id && deletionCheck.status===\'ready\' && !$t && !Tt && !deletionSubmitting.current) {\n    deletionSubmitting.current=true;');
 source=source.replace('Ct(!1);','Ct(!1);deletionSubmitting.current=false;');
 return source;
};
