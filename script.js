let userPhoto = document.getElementById("userPhoto");
let templateLayer = document.getElementById("templateLayer");
let zoomSlider = document.getElementById("zoomSlider");
let rotateSlider = document.getElementById("rotateSlider");

let templates = [];
const templateSections = document.getElementById("templateSections");
const searchInput = document.getElementById("templateSearch");

const text1Input = document.getElementById("text1Input");
const text2Input = document.getElementById("text2Input");
const text1Div = document.getElementById("text1");
const text2Div = document.getElementById("text2");

// Load templates
fetch("templates/templates.json")
.then(res => res.json())
.then(data => {
    templates = data;
    renderSections(templates);
});

// Render template sections by category
function renderSections(list){
    const categories = [...new Set(list.map(t=>t.category))];
    templateSections.innerHTML="";
    categories.forEach(cat=>{
        const section = document.createElement("div");
        section.className="templateSection";
        section.innerHTML=`<h3>${cat}</h3><div class="templateGallery" id="${cat}Gallery"></div>`;
        templateSections.appendChild(section);

        const gallery = document.getElementById(`${cat}Gallery`);
        list.filter(t=>t.category===cat).forEach(t=>{
            const card = document.createElement("div");
            card.className="templateCard";
            card.innerHTML = `
                <img src="${t.src}" alt="${t.name}">
                <h4>${t.name}</h4>
                <button onclick="editTemplate('${t.src}')">Edit</button>
                <button onclick="viewTemplate('${t.src}')">View</button>
            `;
            gallery.appendChild(card);
        });
    });
}

// Search templates
searchInput.addEventListener("input",()=>{
    const val = searchInput.value.toLowerCase();
    renderSections(templates.filter(t=>t.name.toLowerCase().includes(val) || t.category.toLowerCase().includes(val)));
});

// Edit template → load into editor
function editTemplate(src){
    templateLayer.src = src;
    templateLayer.onload = ()=>{
        const editor = document.getElementById("editor");
        const ratio = templateLayer.naturalHeight / templateLayer.naturalWidth;
        editor.style.height = editor.offsetWidth * ratio + "px";

        // Show text boxes
        text1Div.style.display="block";
        text2Div.style.display="block";
    }
}

// View template → modal
const viewModal = document.getElementById("viewModal");
const viewImage = document.getElementById("viewImage");
const closeView = document.getElementById("closeView");
closeView.onclick = ()=>viewModal.style.display="none";
function viewTemplate(src){ viewImage.src=src; viewModal.style.display="flex"; }

// Photo upload
document.getElementById("upload").addEventListener("change", function(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(event){
        userPhoto.src = event.target.result;
        userPhoto.style.display = "block";
        userPhoto.style.top = "50%";
        userPhoto.style.left = "50%";

        // Reset transform & position
        userPhoto.setAttribute('data-x',0);
        userPhoto.setAttribute('data-y',0);
        zoomSlider.value = 150;
        rotateSlider.value = 0;
        userPhoto.style.transform = `translate(0px,0px) scale(${zoomSlider.value/100}) rotate(0deg)`;

        // Reset texts
        text1Div.style.display="none";
        text2Div.style.display="none";
        text1Div.setAttribute('data-x',0);
        text1Div.setAttribute('data-y',0);
        text2Div.setAttribute('data-x',0);
        text2Div.setAttribute('data-y',0);
        text1Input.value="Text 1";
        text2Input.value="Text 2";
        text1Div.textContent="Text 1";
        text2Div.textContent="Text 2";
    }
    reader.readAsDataURL(file);
});

// Text input → editor
text1Input.addEventListener("input",()=>text1Div.textContent=text1Input.value);
text2Input.addEventListener("input",()=>text2Div.textContent=text2Input.value);

// Text color
document.getElementById("text1Color").addEventListener("input",(e)=>text1Div.style.color=e.target.value);
document.getElementById("text2Color").addEventListener("input",(e)=>text2Div.style.color=e.target.value);

// Drag only changes position (scale/rotate unaffected)
interact('#userPhoto, #text1, #text2').draggable({
    listeners: {
        move: function(event){
            let target = event.target;
            let x = (parseFloat(target.getAttribute('data-x'))||0) + event.dx;
            let y = (parseFloat(target.getAttribute('data-y'))||0) + event.dy;
            target.style.transform = `translate(${x}px,${y}px) scale(${zoomSlider.value/100}) rotate(${rotateSlider.value}deg)`;
            target.setAttribute('data-x',x);
            target.setAttribute('data-y',y);
        }
    }
});

// Zoom & rotate sliders
zoomSlider.oninput = rotateSlider.oninput = function(){
    updateTransform();
}
function updateTransform(){
    let x = parseFloat(userPhoto.getAttribute('data-x'))||0;
    let y = parseFloat(userPhoto.getAttribute('data-y'))||0;
    userPhoto.style.transform = `translate(${x}px,${y}px) scale(${zoomSlider.value/100}) rotate(${rotateSlider.value}deg)`;

    x = parseFloat(text1Div.getAttribute('data-x'))||0;
    y = parseFloat(text1Div.getAttribute('data-y'))||0;
    text1Div.style.transform = `translate(${x}px,${y}px) scale(${zoomSlider.value/100}) rotate(${rotateSlider.value}deg)`;

    x = parseFloat(text2Div.getAttribute('data-x'))||0;
    y = parseFloat(text2Div.getAttribute('data-y'))||0;
    text2Div.style.transform = `translate(${x}px,${y}px) scale(${zoomSlider.value/100}) rotate(${rotateSlider.value}deg)`;
}

// Reset button
function resetEditor(){
    zoomSlider.value=150; rotateSlider.value=0;

    userPhoto.setAttribute('data-x',0); userPhoto.setAttribute('data-y',0);
    text1Div.setAttribute('data-x',0); text1Div.setAttribute('data-y',0);
    text2Div.setAttribute('data-x',0); text2Div.setAttribute('data-y',0);

    updateTransform();

    text1Input.value="Text 1"; text2Input.value="Text 2";
    text1Div.textContent="Text 1"; text2Div.textContent="Text 2";
}

// Download
function downloadImage(){
    html2canvas(document.querySelector("#editor")).then(canvas=>{
        let link=document.createElement("a");
        link.download="photo.png";
        link.href=canvas.toDataURL();
        link.click();
    });
}