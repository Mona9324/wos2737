let currentBuff="monday";
let selectedSlot=null;
let bookingOpen=true;

const ADMIN_PASSWORD="2737admin";
let adminAuthenticated=false;

const grid=document.getElementById("slots");
const modal=document.getElementById("modal");
const cancelModal=document.getElementById("cancelModal");

const adminPanel=document.getElementById("adminPanel");

const rankingBox=document.getElementById("rankingBox");

const dbRef=window.db;


function padTime(h,m){
if(m>=60){
h+=Math.floor(m/60);
m=m%60;
}
h=h%24;
return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
}


function switchBuff(buff){
currentBuff=buff;
loadSlots();
}


function openReserveModal(id){
selectedSlot=id;
modal.classList.add("show");
}


function closeModal(){
modal.classList.remove("show");
}


function openCancelModal(id){
selectedSlot=id;
cancelModal.classList.add("show");
}


function closeCancelModal(){
cancelModal.classList.remove("show");
}


function openAdmin(){
adminPanel.classList.add("show");
}


function closeAdmin(){
adminPanel.classList.remove("show");
}


function adminLogin(){

const pw=document.getElementById("adminPass").value;

if(pw===ADMIN_PASSWORD){

adminAuthenticated=true;

document.getElementById("adminControls").style.display="block";

}

}


function setBooking(v){

if(!adminAuthenticated)return;

bookingOpen=v;

alert(v?"Booking Open":"Booking Closed");

}


function clearAll(){

if(!adminAuthenticated)return;

dbRef.collection("slots").get().then(snapshot=>{

snapshot.forEach(doc=>{

doc.ref.delete();

});

});

}


function generateSlots(data){

grid.innerHTML="";

for(let h=0;h<24;h++){

for(let m=0;m<60;m+=30){

const utcTime=padTime(h,m);

const id=currentBuff+"_"+utcTime;

const slot=data[id];

const div=document.createElement("div");

div.className="slot";

if(!bookingOpen){

div.classList.add("locked");

div.innerHTML=`<div class="timeRow">${utcTime} - ${padTime(h,m+30)} UTC</div>
<div class="bookingInfo">Booking Closed</div>`;

}

else if(!slot){

div.classList.add("available");

div.innerHTML=`<div class="timeRow">${utcTime} - ${padTime(h,m+30)} UTC</div>`;

div.onclick=()=>openReserveModal(id);

}

else{

div.classList.add("reserved");

div.innerHTML=`<div class="timeRow">${utcTime} - ${padTime(h,m+30)} UTC</div>
<div class="bookingInfo">[${slot.alliance}] ${slot.player} (${slot.daysSaved} Speed-up)</div>`;

div.onclick=()=>openCancelModal(id);

}

grid.appendChild(div);

}

}

}


function loadSlots(){

dbRef.collection("slots").onSnapshot(snapshot=>{

const data={};

snapshot.forEach(doc=>{

data[doc.id]=doc.data();

});

generateSlots(data);

});

}


function confirmBooking(){

const alliance=document.getElementById("alliance").value;
const player=document.getElementById("player").value;
const daysSaved=document.getElementById("daysSaved").value;
const password=document.getElementById("password").value;

dbRef.collection("slots").doc(selectedSlot).set({

alliance,
player,
daysSaved,
password

}).then(()=>{

closeModal();

});

}


function confirmCancel(){

const pw=document.getElementById("cancelPassword").value;

dbRef.collection("slots").doc(selectedSlot).get().then(doc=>{

if(doc.data().password===pw){

doc.ref.delete();

closeCancelModal();

}

});

}


loadSlots();
