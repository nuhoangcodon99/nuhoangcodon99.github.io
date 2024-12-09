function cuteAlert({
  type,
  title,
  message,
  buttonText = "OK",
  confirmText = "OK",
  cancelText = "Cancel",
  closeStyle,
}) {
  return new Promise((resolve) => {
    // Không dùng `setInterval` không cần thiết để giảm gánh nặng CPU
    const body = document.body;

    // Xác định script hiện tại để tìm đường dẫn tương đối
    const currScript = Array.from(document.scripts).find(script =>
      script.src.includes("cute-alert.js")
    );

    if (!currScript) {
      console.error("cute-alert.js script not found.");
      return;
    }

    const src = currScript.src.substring(0, currScript.src.lastIndexOf("/"));

    const closeStyleTemplate = closeStyle === "circle" ? "alert-close-circle" : "alert-close";

    // Tạo nút bấm dựa trên loại thông báo
    const btnTemplate = type === "question" ? `
      <div class="question-buttons">
        <button class="confirm-button ${type}-bg ${type}-btn">${confirmText}</button>
        <button class="cancel-button error-bg error-btn">${cancelText}</button>
      </div>
    ` : `
      <button class="alert-button ${type}-bg ${type}-btn">${buttonText}</button>
    `;

    // Template chính của alert
    const template = `
      <div class="alert-wrapper">
        <div class="alert-frame">
          <div class="alert-header ${type}-bg">
            <span class="${closeStyleTemplate}">X</span>
            <img class="alert-img" src="${src}/img/${type}.svg" alt="${type} icon" />
          </div>
          <div class="alert-body">
            <span class="alert-title">${title}</span>
            <span class="alert-message">${message}</span>
            ${btnTemplate}
          </div>
        </div>
      </div>
    `;

    // Thêm template vào DOM
    body.insertAdjacentHTML("beforeend", template);

    const alertWrapper = document.querySelector(".alert-wrapper");
    const alertFrame = document.querySelector(".alert-frame");
    const alertClose = document.querySelector(`.${closeStyleTemplate}`);

    // Xử lý sự kiện cho từng loại alert
    if (type === "question") {
      const confirmButton = document.querySelector(".confirm-button");
      const cancelButton = document.querySelector(".cancel-button");

      confirmButton.addEventListener("click", () => {
        cleanup(alertWrapper, resolve, "confirm");
      });

      cancelButton.addEventListener("click", () => {
        cleanup(alertWrapper, resolve, null);
      });
    } else {
      const alertButton = document.querySelector(".alert-button");

      alertButton.addEventListener("click", () => {
        cleanup(alertWrapper, resolve, null);
      });
    }

    alertClose.addEventListener("click", () => cleanup(alertWrapper, resolve, null));

    // Ngăn chặn đóng khi click vào frame
    alertFrame.addEventListener("click", (e) => e.stopPropagation());

    // Đóng khi click ra ngoài frame
    alertWrapper.addEventListener("click", () => cleanup(alertWrapper, resolve, null));
  });
}

function cuteToast({ type, message, timer = 5000 }) {
  return new Promise((resolve) => {
    // Xóa container cũ nếu tồn tại
    const existingToast = document.querySelector(".toast-container");
    if (existingToast) existingToast.remove();

    const body = document.body;

    // Xác định script hiện tại để tìm đường dẫn tương đối
    const currScript = Array.from(document.scripts).find(script =>
      script.src.includes("cute-alert.js")
    );

    if (!currScript) {
      console.error("cute-alert.js script not found.");
      return;
    }

    const src = currScript.src.substring(0, currScript.src.lastIndexOf("/"));

    // Template chính của toast
    const template = `
      <div class="toast-container ${type}-bg">
        <div>
          <div class="toast-frame">
            <img class="toast-img" src="${src}/img/${type}.svg" alt="${type} icon" />
            <span class="toast-message">${message}</span>
            <div class="toast-close">X</div>
          </div>
          <div class="toast-timer ${type}-timer" style="animation: timer ${timer}ms linear;"></div>
        </div>
      </div>
    `;

    // Thêm template vào DOM
    body.insertAdjacentHTML("beforeend", template);

    const toastContainer = document.querySelector(".toast-container");

    // Tự động đóng sau timer
    const toastTimeout = setTimeout(() => {
      cleanup(toastContainer, resolve, null);
    }, timer);

    const toastClose = document.querySelector(".toast-close");

    toastClose.addEventListener("click", () => {
      clearTimeout(toastTimeout); // Hủy timeout khi đóng bằng nút
      cleanup(toastContainer, resolve, null);
    });
  });
}

// Hàm hỗ trợ dọn dẹp DOM và giải phóng Promise
function cleanup(element, resolve, result) {
  if (element) element.remove();
  resolve(result);
}