class JJSlider extends HTMLElement {
	static activeKnob = null;
	
    constructor() {
        super();
        
	}
	
	 connectedCallback() {
        // Called when the component is added to the DOM

		 this.attachShadow({ mode: 'open' }); // or 'closed' if you don't want to expose the shadow DOM
		this.steps = 10;
        // Get the attributes (width, height, etc.)
        this.width = this.getAttribute('width') || '100%'; // Default width
        this.height = this.getAttribute('height') || '100%'; // Default height
		this.knobWidth = this.getAttribute('knobwidth') || '10%';
		this.sliderType = this.getAttribute('slidertype') || 'single'; //single or double
		
        const style = document.createElement('style'); //need to add style things
        // Add HTML to the shadow DOM //Should I use templates for each kind of slider???
        this.sliderDiv = makeElement("div",{class:"jjslider"});
		this.sliderDiv.appendChild(
			makeElement("div",{class:"jjslideTrack"}));
		

		
		
		
		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(this.sliderDiv);
		style.textContent = ` 
		.jjslider{
			width: 100%;
			height: 100%;
			background-color:#262626;
			align-items: center;
			position: relative;
			display: flex;
			justify-content: center;
			flex-wrap: nowrap;
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			color: black;
		}

		
		.jjslideTrack{
			
			width:100%;
			height: 2px;
			background-color: #0008;
			
			left:0px;
		}
		
		.jjslideKnob{
			width: ${this.knobWidth};
			height: calc(100% + 2px);
			background-color: #bdbdbd;
			position: absolute;
			/*border: 1px red solid;*/
			/* left: 0%; */
			/*place-self: center;*/
			/*translate: -5px;*/
			box-sizing: border-box;
			/* inset: 40px -21px; */
		}
		
		.jjslideKnob:hover {
			
			background-color:#eaeaea;
			cursor: grab;
			
		}
		
		.jjslideKnob .sliding, .jjslideKnob:active{
			height:calc(100% + 4px);
			background-color:#fff;
			cursor: none;
			/*border: 1px black solid;*/
		}
		
		:host { 
		background: rgba(100,1,0,0.3); 
		
		width: ${this.width};
		height: ${this.height};
		display:inline-block;
		box-sizing: border-box;
		}
		`;
		
		if(this.sliderType == "double"){
			this.minKnob = makeElement("div",{
				class:"jjslideKnob jjminKnob",
				style:"left:4px;"});
				this.minKnob.parent = this;
			this.sliderDiv.appendChild(this.minKnob);
			this.value1 = 0;
			
			this.maxKnob = makeElement("div",{
				class:"jjslideKnob jjmaxKnob",
				style:"left:100%"});
				this.maxKnob.parent = this;
			this.sliderDiv.appendChild(this.maxKnob);
			this.value2 = 100;

			//this.maxKnob.style = `left:calc(${this.getBoundingClientRect().width}px + 4px - ${this.maxKnob.getBoundingClientRect().width}px);`;
			this.maxKnob.style = `left:calc(100% + 6px - ${this.maxKnob.getBoundingClientRect().width}px);`;
			//console.log(this.maxKnob.getBoundingClientRect());
			/* console.log(
			(this.getBoundingClientRect().width
			+ 4
			- this.maxKnob.getBoundingClientRect().width)/this.getBoundingClientRect().width); */
		}
		
		else{
			this.knob = makeElement("div",{class:"jjslideKnob",style:"left:50%;"});
			this.sliderDiv.appendChild(this.knob);
			this.knob.parent = this;
			this.value = 0.5;
			
		}
		
		//maxAllowedX = rect.width + 4  - knobRect.width
		
		console.log(Array.from(this.shadowRoot.querySelectorAll(".jjslideKnob")));
		Array.from(this.shadowRoot.querySelectorAll(".jjslideKnob")).forEach((e)=>{
			e.addEventListener("mousedown",JJSlider.handleMouseDown)
		});
		this.addEventListener("dragstart",(e)=>{e.preventDefault();e.stopPropagation();});
    }
	
	
	
	//Static Methods
	
	static dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, detail);
        this.dispatchEvent(event);
    }
	
	static handleMouseDown(e){
		
		e.target.closest(".jjslider").isDragging = true;
		JJSlider.activeKnob = e.target;
		e.target.classList.add("sliding");
		document.addEventListener("mouseup",JJSlider.handleMouseUp,{once:true});
		document.addEventListener("mousemove",JJSlider.handleMouseMove);
		console.log(JJSlider.activeKnob,JJSlider.activeKnob.parent);
		//document.body.style.cursor = "none";
		
	}
	
	static handleMouseUp(e){
		
		document.removeEventListener("mousemove",JJSlider.handleMouseMove);
		document.removeEventListener("mouseup",JJSlider.handleMouseUp);
		JJSlider.activeKnob.closest(".jjslider").isDragging = false;
		JJSlider.activeKnob.classList.remove("sliding");
		JJSlider.activeKnob = null;
		//document.body.style.cursor = "";
	}
	
	static handleMouseMove(e){
		const jjselement = JJSlider.activeKnob.parent; //<jj-slider> element
		const slider = JJSlider.activeKnob.closest(".jjslider");
	    const rect = slider.getBoundingClientRect(); //slider rect
		const knobRect = JJSlider.activeKnob.getBoundingClientRect();
		let valueOut = "value";
		let newX = e.clientX - rect.left; //pixels of mouse from left of slider start
		let minAllowedX = 1; //width 4 for 10 /2 -border? knobRect.width/2
		let maxAllowedX = rect.width - 0 - knobRect.width -2  ; //rect.width -6 for 10 //width /2 +border*2?
		//const sliderKnobs = Array.from(slider.getElementsByClassName("jjslideKnob"));
		let eventDetail ={
			newX:newX,
			minAllowedX:minAllowedX,
			maxAllowedX:maxAllowedX,
			knobWidth:knobRect.width,
			sliderWidth:rect.width,
			sliderleft:rect.left,
			otherKnobWidth:0,
			otherKnobLeft:0,
			otherKnobOffest:0,
			plusKnobWidth:0,
			minusKnobWidth:0,
			knobLeft:knobRect.left,
			knobOffset:0,
			newLeft:0,
			plusKnob:0
		};
		
		
		if(jjselement.sliderType == "double"){
			//const otherKnob = JJSlider.activeKnob == jjselement.minKnob ? jjselement.maxKnob: jjselement.minKnob;
			let otherRect = null;
		    if (JJSlider.activeKnob == jjselement.minKnob) { //why do these numbers work???
				otherRect = jjselement.maxKnob.getBoundingClientRect();
		        maxAllowedX = otherRect.left - rect.left - (otherRect.width)/2 - (otherRect.width/2 -2);
				maxAllowedX = otherRect.left - rect.left - knobRect.width;
				//maxAllowedX = rect.width - (rect.width - otherRect.left - rect.left + knobRect.width-4); //unmmmmmmmmmmm
				//console.log(rect.width,(rect.width - otherRect.left - rect.left));
				valueOut = "value1";
		    } else {
				otherRect = jjselement.minKnob.getBoundingClientRect();
		        minAllowedX = otherRect.left - rect.left + otherRect.width + otherRect.width2 +2;
				minAllowedX = otherRect.left +4 - rect.left + knobRect.width;
				valueOut = "value2";
		    }
			
			eventDetail.otherKnobWidth = otherRect.width;
			eventDetail.otherKnobLeft = otherRect.left;
			eventDetail.otherKnobOffest = otherRect.left - rect.left;
			eventDetail.plusKnobWidth = otherRect.left - rect.left  + otherRect.width;
			eventDetail.minusKnobWidth = otherRect.left - rect.left  - otherRect.width;
			eventDetail.minAllowedX = minAllowedX;
			eventDetail.maxAllowedX = maxAllowedX;
			
		}

		
			
	    // Clamp the position within the allowed range
	    newX = Math.floor(Math.max(minAllowedX, Math.min(newX, maxAllowedX)));
		eventDetail.newLeft = newX;
		eventDetail.plusKnob = newX + knobRect.width;
		
		//newX = (rect.width +2 - knobRect.width)/jjselement.steps * Math.floor(newX / ((rect.width +2 - knobRect.width)/jjselement.steps)); //put in the right place for steps
	    // Update control's position using left property (percentage)
		
	    JJSlider.activeKnob.style.left = (newX)/(Math.floor(rect.width-4)) *100 + '%';
		jjselement[valueOut] = (newX-0) /(rect.width -(knobRect.width)); // 0-1
		//slider[String(JJSlider.activeKnob.attributes.value.value)] = (newX-4) /(rect.width -(knobRect.width)) * 100;
		
		//console.log(jjselement[valueOut]);
		
		//console.log(Math.min(Math.max((e.clientX - rect.left)/rect.width, 0), 1));
		document.getSelection().empty()
		JJSlider.dispatchCustomEvent.apply(JJSlider.activeKnob,["input",{bubbles:true,composed:true,detail:eventDetail}]);
	}
	
	
/* 
    // Custom events
    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.dispatchEvent(event);
    }

    // Lifecycle methods (if needed)
   

    disconnectedCallback() {
        // Called when the component is removed from the DOM
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Called when an attribute is changed
        if (name === 'width') {
            this.width = newValue;
            // Update the width of the component
        } else if (name === 'height') {
            this.height = newValue;
            // Update the height of the component
        }
    }

    // Other methods (if needed)
    someMethod() {
        // Add your component's logic here
        this.dispatchCustomEvent('my-event', { message: 'Hello from MyWebComponent!' });
    } */
	
	
	
}

// Define the custom element


customElements.define('jj-slider', JJSlider);

var activeSlider = "wookie";

//Helper Functions

//make an element with attributes
function makeElement(tagName,attributes){
	const element = document.createElement(tagName);
	
	for (const name in attributes){
		
		element.setAttribute(name,attributes[name]);
	}
	
	return element;
}

