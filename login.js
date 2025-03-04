// login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login100-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = form.querySelector('input[name="username"]').value;
      const password = form.querySelector('input[name="pass"]').value;
      // Call the login API exposed by the preload script
      const result = await window.loginAPI.login({ username, password });
      if (!result.success) {
        alert(result.message || "Login failed");
      }
      // If login is successful, main process will open the main window.
    });
  
    // Attach an event listener to the Exit button
    const exitBtn = document.querySelector('.exit100-form-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', async () => {
        await window.loginAPI.exit();
      });
    }
  });
  