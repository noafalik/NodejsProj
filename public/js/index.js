const init = () =>{
    addEvents();
} 

const addEvents = () =>{
 const arrow = document.querySelector("#arrow_id");
 const mainDiv = document.querySelector("#main_id");
 const topOfMain = mainDiv.offsetTop;
 arrow.addEventListener("click", ()=>{
    window.scrollTo({
        top: topOfMain,
        behavior: "smooth",
      });
 })
}

init();