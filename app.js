let currentBuff="monday"
let selectedSlot=null

const ADMIN_PASSWORD="2737admin"

let adminAuthenticated=false
let bookingOpen=false

const svsDate=new Date("2026-03-23T00:00:00Z")

// 예약 자동 오픈
const bookingStart=new Date("2026-03-20T00:00:00Z")

const grid=document.getElementById("slots")

function updateCountdown(){

let now=new Date()
let diff=svsDate-now

let d=Math.floor(diff/(1000*60*60*24))
let h=Math.floor((diff/(1000*60*60))%24)
let m=Math.floor((diff/(1000*60))%60)

document.getElementById("countdown").innerHTML=
"SVS begins in "+d+"d "+h+"h "+m+"m"

}

setInterval(updateCountdown,60000)
updateCountdown()

function loadSlots(){

db.collection("slots").onSnapshot(snapshot=>{

let data={}

snapshot.forEach(doc=>{
data[doc.id]=doc.data()
})

generateSlots(data)
updateCounts(data)

})

}

loadSlots()

function switchBuff(buff){

currentBuff=buff
loadSlots()

}

function generateSlots(data){

grid.innerHTML=""

for(let h=0;h<24;h++){
for(let m=0;m<60;m+=30){

let utcTime=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")

let localDate=new Date(Date.UTC(2024,0,1,h,m))
let localTime=localDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})

let id=currentBuff+"_"+utcTime

let div=document.createElement("div")

let slot=data[id]

let now=new Date()
let autoOpen = now > bookingStart

if(!bookingOpen && !autoOpen){

div.className="slot locked"
div.innerHTML="<b>"+utcTime+" UTC</b><br>"+localTime+"<br>🔒"

}else if(!slot){

div.className="slot available"

if(h<6) div.classList.add("timeNight")
if(h>=6 && h<18) div.classList.add("timeDay")

div.innerHTML=
"<b>"+utcTime+" UTC</b><br>"+
localTime+"<br>Available"

div.onclick=()=>openModal(id)

}else{

div.className="slot reserved"

let priority=""

if(slot.days>=10){
priority="⭐"
div.classList.add("priorityHigh")
}

div.innerHTML=
"<b>"+utcTime+" UTC</b><br>"+
localTime+"<br><br>"+
slot.alliance+" - "+slot.player+
"<br>"+slot.days+" days "+priority

if(adminAuthenticated){

div.onclick=()=>{
if(confirm("관리자가 이 예약을 삭제할까요?")){
db.collection("slots").doc(id).delete()
}
}

}else{

div.onclick=()=>cancelBooking(id,slot.password)

}

}

grid.appendChild(div)

}
}

}

function updateCounts(data){

let reserved=0

for(let key in data){
if(key.startsWith(currentBuff)) reserved++
}

let total=48

document.getElementById("reservedCount").innerText=reserved
document.getElementById("availableCount").innerText=total-reserved

}

function openModal(id){

selectedSlot=id
document.getElementById("modal").style.display="flex"

}

function closeModal(){

document.getElementById("modal").style.display="none"

}

function confirmBooking(){

let alliance=document.getElementById("alliance").value.toUpperCase()
let player=document.getElementById("player").value
let password=document.getElementById("password").value
let days=parseInt(document.getElementById("daysSaved").value)

if(!alliance || !player || !password){

alert("모든 정보를 입력하세요")
return

}

db.collection("slots").doc(selectedSlot).create({

alliance,
player,
password,
days

}).catch(()=>{

alert("이미 예약된 슬롯입니다")

})

closeModal()

}

function cancelBooking(id,correctPassword){

let input=prompt("취소 비밀번호 입력")

if(input!==correctPassword){

alert("비밀번호 틀림")
return

}

if(!confirm("예약을 취소할까요?")) return

db.collection("slots").doc(id).delete()

}

function openAdmin(){

document.getElementById("adminPanel").style.display="block"

}

function closeAdmin(){

document.getElementById("adminPanel").style.display="none"

}

function adminLogin(){

let pass=document.getElementById("adminPass").value

if(pass!==ADMIN_PASSWORD){

alert("비밀번호 틀림")
return

}

adminAuthenticated=true

document.getElementById("adminLogin").style.display="none"
document.getElementById("adminControls").style.display="block"

}

function setBooking(state){

if(!adminAuthenticated){
alert("관리자 로그인 필요")
return
}

db.collection("settings").doc("booking").set({
open:state
})

}

function clearAll(){

if(!adminAuthenticated){
alert("관리자 로그인 필요")
return
}

if(!confirm("모든 예약 삭제?")) return

db.collection("slots").get().then(snapshot=>{

snapshot.forEach(doc=>{
doc.ref.delete()
})

})

}
