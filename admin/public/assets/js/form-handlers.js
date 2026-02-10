class FormHandlers{constructor(){this.init()}init(){this.initFormValidation(),this.initFileUploads(),this.initFormSubmissions(),this.initFormReset(),this.initAutoSave()}initFormValidation(){document.querySelectorAll("input, select, textarea").forEach(e=>{e.addEventListener("blur",e=>{this.validateField(e.target)}),e.addEventListener("input",e=>{this.clearFieldError(e.target)})}),document.querySelectorAll("form").forEach(t=>{t.addEventListener("submit",e=>{this.validateForm(t)||(e.preventDefault(),e.stopPropagation())})})}validateField(e){var t=e.value.trim(),i=e.type;let r=!0,a="";if(e.hasAttribute("required")&&!t&&(r=!1,a="This field is required"),t&&r)switch(i){case"email":this.isValidEmail(t)||(r=!1,a="Please enter a valid email address");break;case"tel":this.isValidPhone(t)||(r=!1,a="Please enter a valid phone number");break;case"url":this.isValidURL(t)||(r=!1,a="Please enter a valid URL")}var o=e.getAttribute("minlength"),i=e.getAttribute("maxlength");return o&&t.length<parseInt(o)&&(r=!1,a=`Minimum ${o} characters required`),i&&t.length>parseInt(i)&&(r=!1,a=`Maximum ${i} characters allowed`),r?this.clearFieldError(e):this.showFieldError(e,a),r}validateForm(e){let t=!0;const i=e.querySelectorAll("input, select, textarea");return i.forEach(e=>{this.validateField(e)||(t=!1)}),t}showFieldError(e,t){this.clearFieldError(e),e.classList.add("is-invalid");const i=document.createElement("div");i.className="invalid-feedback",i.textContent=t,e.parentNode.appendChild(i)}clearFieldError(e){e.classList.remove("is-invalid");const t=e.parentNode.querySelector(".invalid-feedback");t&&t.remove()}initFileUploads(){document.querySelectorAll('input[type="file"]').forEach(e=>{e.addEventListener("change",e=>{this.handleFileUpload(e.target)})}),document.querySelectorAll(".file-drop-zone").forEach(i=>{i.addEventListener("dragover",e=>{e.preventDefault(),i.classList.add("drag-over")}),i.addEventListener("dragleave",e=>{e.preventDefault(),i.classList.remove("drag-over")}),i.addEventListener("drop",e=>{e.preventDefault(),i.classList.remove("drag-over");e=e.dataTransfer.files;if(0<e.length){const t=i.querySelector('input[type="file"]');t&&(t.files=e,this.handleFileUpload(t))}})})}handleFileUpload(e){var t=e.files;const r=e.parentNode.querySelector(".file-preview");0<t.length&&r&&(r.innerHTML="",Array.from(t).forEach(t=>{const i=document.createElement("div");if(i.className="file-item d-flex align-items-center mb-2",t.type.startsWith("image/")){const e=new FileReader;e.onload=e=>{i.innerHTML=`
                            <img src="${e.target.result}" class="me-2" style="width: 40px; height: 40px; object-fit: cover;">
                            <div>
                                <div class="fw-medium">${t.name}</div>
                                <small class="text-muted">${this.formatFileSize(t.size)}</small>
                            </div>
                        `},e.readAsDataURL(t)}else i.innerHTML=`
                        <i class="bx bx-file me-2 fs-4"></i>
                        <div>
                            <div class="fw-medium">${t.name}</div>
                            <small class="text-muted">${this.formatFileSize(t.size)}</small>
                        </div>
                    `;r.appendChild(i)}))}initFormSubmissions(){document.querySelectorAll("form").forEach(t=>{t.addEventListener("submit",e=>{e.preventDefault(),this.handleFormSubmission(t)})})}handleFormSubmission(t){var e;this.validateForm(t)?(e=new FormData(t),Object.fromEntries(e),this.showFormLoading(t),setTimeout(()=>{this.hideFormLoading(t),this.showNotification("Form submitted successfully!","success"),t.hasAttribute("data-reset-on-submit")&&(t.reset(),t.classList.remove("was-validated"));const e=t.getAttribute("data-redirect");e&&setTimeout(()=>{window.location.href=e},1e3)},2e3)):this.showNotification("Please fix the errors in the form","error")}showFormLoading(e){const t=e.querySelector('button[type="submit"]');t&&(t.disabled=!0,t.innerHTML='<i class="bx bx-loader-alt bx-spin me-1"></i> Processing...')}hideFormLoading(e){const t=e.querySelector('button[type="submit"]');t&&(t.disabled=!1,t.innerHTML=t.getAttribute("data-original-text")||"Submit")}initFormReset(){document.querySelectorAll(".form-reset").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();e=t.closest("form");e&&this.resetForm(e)})})}resetForm(e){e.reset(),e.classList.remove("was-validated"),e.querySelectorAll(".is-invalid").forEach(e=>{this.clearFieldError(e)}),e.querySelectorAll(".file-preview").forEach(e=>{e.innerHTML=""}),this.showNotification("Form reset successfully","info")}initAutoSave(){document.querySelectorAll("form[data-auto-save]").forEach(e=>{var t=parseInt(e.getAttribute("data-auto-save"))||3e4;setInterval(()=>{this.autoSaveForm(e)},t)})}autoSaveForm(e){var t=new FormData(e),t=Object.fromEntries(t),e=e.id||"form-"+Date.now();localStorage.setItem(`form-${e}`,JSON.stringify(t)),this.showAutoSaveIndicator()}showAutoSaveIndicator(){let e=document.querySelector(".auto-save-indicator");e||(e=document.createElement("div"),e.className="auto-save-indicator position-fixed bottom-0 end-0 m-3",e.innerHTML='<small class="text-muted"><i class="bx bx-check me-1"></i> Auto-saved</small>',document.body.appendChild(e)),e.style.opacity="1",setTimeout(()=>{e.style.opacity="0"},2e3)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\+]?[1-9][\d]{0,15}$/.test(e.replace(/[\s\-\(\)]/g,""))}isValidURL(e){try{return new URL(e),!0}catch{return!1}}formatFileSize(e){if(0===e)return"0 Bytes";var t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(2))+" "+["Bytes","KB","MB","GB"][t]}showNotification(e,t="info"){if(window.dashboard&&window.dashboard.showNotification)window.dashboard.showNotification(e,t);else{const i=document.createElement("div");i.className=`alert alert-${t} alert-dismissible fade show position-fixed top-0 end-0 m-3`,i.style.zIndex="9999",i.innerHTML=`
                ${e}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `,document.body.appendChild(i),setTimeout(()=>{i.remove()},5e3)}}}document.addEventListener("DOMContentLoaded",function(){new FormHandlers});const formStyle=document.createElement("style");formStyle.textContent=`
    .file-drop-zone {
        border: 2px dashed #dee2e6;
        border-radius: 0.375rem;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .file-drop-zone.drag-over {
        border-color: #0d6efd;
        background-color: rgba(13, 110, 253, 0.1);
    }
    
    .file-item {
        padding: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        background-color: #f8f9fa;
    }
    
    .auto-save-indicator {
        transition: opacity 0.3s ease;
        z-index: 1000;
    }
    
    .form-control.is-invalid {
        border-color: #dc3545;
    }
    
    .invalid-feedback {
        display: block;
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
`,document.head.appendChild(style);