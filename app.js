let currentBuff="monday"
let selectedSlot=null

const ADMIN_PASSWORD="2737admin"

let adminAuthenticated=false
let bookingOpen=false

const svsDate=new Date("2026-03-23T00:00:00Z")

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

db.collection("settings").doc("booking").onSnapshot(doc=>{

if(doc.exists){
bookingOpen=doc.data().open
}

loadSlots()

})

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

function switchBuff(buff){

currentBuff=buff
loadSlots()

}

function generateSlots(data){

grid.innerHTML=""

for(let h=0;h<24;h++){
for(let m=0;m<60;m+=30){

let startUTC=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")

let endM=m+30
let endH=h
if(endM==60){endM=0;endH++}

let endUTC=String(endH).padStart(2,"0")+":"+String(endM).padStart(2,"0")

let localStart=new Date()
localStart.setUTCHours(h,m)

let localEnd=new Date()
localEnd.setUTCHours(endH,endM)

let localStartStr=localStart.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
let localEndStr=localEnd.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})

let id=currentBuff+"_"+startUTC

let div=document.createElement("div")

let slot=data[id]

if(!bookingOpen){

div.className="slot locked"

div.innerHTML=
"<div class='timeUTC'>"+startUTC+" - "+endUTC+" UTC</div>"+
"<div class='timeLocal'>"+localStartStr+" - "+localEndStr+"</div>"+
"<br>🔒"

}else if(!slot){

div.className="slot available"

div.innerHTML=
"<div class='timeUTC'>"+startUTC+" - "+endUTC+" UTC</div>"+
"<div class='timeLocal'>"+localStartStr+" - "+localEndStr+"</div>"+
"<br>Available"

div.onclick=()=>openModal(id)

}else{

div.className="slot reserved"

div.innerHTML=
"<div class='timeUTC'>"+startUTC+" - "+endUTC+" UTC</div>"+
"<div class='timeLocal'>"+localStartStr+" - "+localEndStr+"</div>"+
"<div class='bookingInfo'>["+slot.alliance+"] "+slot.player+
" ("+slot.days+")</div>"

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

document.getElementById("reservedCount").innerText="Reserved "+reserved
document.getElementById("availableCount").innerText="Available "+(total-reserved)

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
let days=document.getElementById("daysSaved").value

if(!alliance || !player || !password){

alert("Fill all fields")
return

}

db.collection("slots").doc(selectedSlot).create({

alliance,
player,
password,
days

}).catch(()=>{

alert("Already reserved")

})

closeModal()

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

alert("Wrong password")
return

}

adminAuthenticated=true

document.getElementById("adminLogin").style.display="none"
document.getElementById("adminControls").style.display="block"

}

function setBooking(state){

if(!adminAuthenticated){
alert("Admin login required")
return
}

db.collection("settings").doc("booking").set({
open:state
})

}

function clearAll(){

if(!adminAuthenticated){
alert("Admin login required")
return
}

if(!confirm("Delete all reservations?")) return

db.collection("slots").get().then(snapshot=>{

snapshot.forEach(doc=>{
doc.ref.delete()
})

})

}

/* SNOW */

const canvas=document.getElementById("snow")
const ctx=canvas.getContext("2d")

canvas.width=window.innerWidth
canvas.height=window.innerHeight

let snowflakes=[]

for(let i=0;i<80;i++){

snowflakes.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
r:Math.random()*3+1,
d:Math.random()+1

})

}

function drawSnow(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="white"
ctx.beginPath()

for(let i=0;i<snowflakes.length;i++){

let f=snowflakes[i]

ctx.moveTo(f.x,f.y)
ctx.arc(f.x,f.y,f.r,0,Math.PI*2,true)

}

ctx.fill()

moveSnow()

}

function moveSnow(){

for(let i=0;i<snowflakes.length;i++){

let f=snowflakes[i]

f.y+=Math.pow(f.d,2)+1

if(f.y>canvas.height){

snowflakes[i]={

x:Math.random()*canvas.width,
y:0,
r:f.r,
d:f.d

}

}

}

}

setInterval(drawSnow,33)
