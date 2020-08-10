let place = (where, what, direction) => {

}
// calculate where item will be placed while moving it
let placehold = (x, y) => {
    let popup_offset_left = document.getElementById("popup").getBoundingClientRect().left
    let popup_offset_top = document.getElementById("popup").getBoundingClientRect().top + 1
    let shadowRoot = document.getElementById("popup").shadowRoot
    let content = shadowRoot.getElementById("content")
    let hovered_items = shadowRoot.querySelectorAll(':hover')
    let where
    let direction
    if (hovered_items.length > 0) {
        var height = 0
        for (let element of content.children) {
            console.log(element.getBoundingClientRect().top - parseInt(window.getComputedStyle(element).marginTop) - popup_offset_top, element.getBoundingClientRect().top + element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginBottom) - popup_offset_top)
            if (y > element.getBoundingClientRect().top - parseInt(window.getComputedStyle(element).marginTop) && y < element.getBoundingClientRect().top + element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginBottom)) {
                console.log("jesteśmy w tym elemencie")
                console.log(element)
                if (y < 0.33 * element.getBoundingClientRect().top + element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginBottom)) {
                    console.log("nad")
                } else if (y < 0.66 * element.getBoundingClientRect().top + element.getBoundingClientRect().height + parseInt(window.getComputedStyle(element).marginBottom)) {
                    console.log("w")
                }
            } else
                console.log(x - popup_offset_left, y - popup_offset_top)

        }
    }
}
// function to drag elements around
let drag = function (e) {
    let element = this.cloneNode(true);
    document.body.appendChild(element)
    element.style.position = "absolute"
    element.style.left = e.clientX + "px"
    element.style.top = e.clientY + "px"
    element.style.width = this.getBoundingClientRect().width + "px"
    element.style.height = this.getBoundingClientRect().height + "px"
    element.style.borderColor = "black"
    element.style.color = "black"
    let up = function (e) {
        e.preventDefault();
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
        element.parentElement.removeChild(element)
    }
    let move = function (e) {
        e.preventDefault();
        element.style.left = e.clientX + 10 + "px"
        element.style.top = e.clientY + 10 + "px"
        placehold(e.clientX, e.clientY)
    }
    window.addEventListener("mouseup", up)

    window.addEventListener("mousemove", move)
}
let initialize = () => {
    //generate list of draggable elements
    let tools = document.getElementById("tools")
    for (let element of document.getElementsByClassName("template")) {
        let div = document.createElement("div")
        div.className = "draggable_item"
        div.textContent = "P"
        tools.appendChild(div)
        div.addEventListener("mousedown", drag)
    }

    //collapse and expand toolbar with draggable elements
    let toolbar = document.getElementById("toolbar")
    document.getElementById("open_toolbar_button").addEventListener("click", () => {
        if (toolbar.classList.contains("left__toolbar--open"))
            toolbar.classList.remove("left__toolbar--open")
        else
            toolbar.classList.add("left__toolbar--open")
    })

    // create shadow dom and give it basic styles
    class Popup extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({
                mode: 'open'
            })
            const style = document.createElement('style');
            style.textContent = `
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .wrapper{
                    max-width: 600px;
                    min-width: 280px;
                    width: 100%;
                    height: 600px;
                }
                .content{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .row{
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    height: 50px;
                }
                `;
            shadow.appendChild(style)
            let wrapper = document.createElement("div")
            wrapper.classList.add("wrapper")
            shadow.appendChild(wrapper)
            let content = document.createElement("div")
            content.classList.add("content")
            content.id = "content"
            wrapper.appendChild(content)
            let row = document.createElement("div")
            row.classList.add("row")
            content.appendChild(row)
        }
    }
    customElements.define('popup-container', Popup);
}
initialize()