document.addEventListener("DOMContentLoaded", function () {
    // Mock user records
    const users = {
        "user1@clinic.com": { name: "User One", password: "Password@123" },
        "user2@clinic.com": { name: "User Two", password: "Password@456" }
    };

    // Elements
    const loginPage = document.getElementById("login-page");
    const homePage = document.getElementById("home-page");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const medicineTable = document.getElementById("medicine-table").getElementsByTagName("tbody")[0];
    const addMedicineButton = document.getElementById("add-medicine-button");
    const addMedicineModal = document.getElementById("add-medicine-modal");
    const closeModalButton = document.getElementById("close-modal");
    const cancelAddButton = document.getElementById("cancel-add");
    const addMedicineForm = document.getElementById("add-medicine-form");
    const logoutButton = document.getElementById("logout-button");
    const loginError = document.getElementById("login-error");
    const signupError = document.getElementById("signup-error");
    const showLoginButton = document.getElementById("show-login");
    const showSignupButton = document.getElementById("show-signup");
    
    // Delete confirmation modal elements
    const deleteConfirmModal = document.getElementById("delete-confirm-modal");
    const closeDeleteModal = document.getElementById("close-delete-modal");
    const cancelDeleteButton = document.getElementById("cancel-delete");
    const confirmDeleteButton = document.getElementById("confirm-delete");
    const medicineToDeleteSpan = document.getElementById("medicine-to-delete");
    

    function isStrongPassword(password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
        return strongPasswordRegex.test(password);
    }

    function showLoginForm() {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        showLoginButton.classList.add("active");
        showSignupButton.classList.remove("active");
        loginError.textContent = "";
        signupError.textContent = "";
    }

    function showSignupForm() {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        showSignupButton.classList.add("active");
        showLoginButton.classList.remove("active");
        loginError.textContent = "";
        signupError.textContent = "";
    }

    showLoginButton.addEventListener("click", showLoginForm);
    showSignupButton.addEventListener("click", showSignupForm);

    // Current medicine index to delete
    let medicineIndexToDelete = -1;
    
    // Stats elements
    const totalMedicinesElement = document.getElementById("total-medicines");
    const totalCategoriesElement = document.getElementById("total-categories");
    const lowStockElement = document.getElementById("low-stock");

    // Medicine data (temporary)
    let medicines = [
        { name: "Paracetamol", category: "Painkiller", price: 10, quantity: 100, manufacturer: "XYZ Pharma", expiry: "2025-12-31", unit: "tablet", description: "Pain reliever" },
        { name: "Ibuprofen", category: "Anti-inflammatory", price: 15, quantity: 200, manufacturer: "ABC Corp", expiry: "2026-03-01", unit: "capsule", description: "Reduces inflammation" },
        { name: "Amoxicillin", category: "Antibiotic", price: 25, quantity: 50, manufacturer: "Health Labs", expiry: "2024-09-15", unit: "capsule", description: "Treats bacterial infections" },
        { name: "Cetirizine", category: "Antihistamine", price: 8, quantity: 30, manufacturer: "Pharma Inc", expiry: "2025-07-22", unit: "tablet", description: "Allergy relief" }
    ];

    // Constants
    const LOW_STOCK_THRESHOLD = 50;

    // Function to reset form fields
    function resetFormFields(form) {
        form.reset();
        // Clear any error messages if they exist
        const errorElements = form.querySelectorAll('.error');
        errorElements.forEach(element => element.textContent = '');
    }

    // Display medicines in the table
    function displayMedicines() {
        medicineTable.innerHTML = "";
        medicines.forEach((medicine, index) => {
            const row = document.createElement("tr");
            
            let quantityClass = "";
            if (medicine.quantity <= LOW_STOCK_THRESHOLD) {
                quantityClass = "low-stock";
            }
            
            row.innerHTML = `
                <td>${medicine.name}</td>
                <td>${medicine.category}</td>
                <td>$${medicine.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-actions">
                        <span class="${quantityClass}">${medicine.quantity} ${medicine.unit}(s)</span>
                        <input type="number" value="${medicine.quantity}" min="1" class="quantity-input" data-index="${index}">
                        <button class="update-quantity-btn" data-index="${index}"><span class="icon icon-sync"></span></button>
                        <button class="delete-medicine-btn" data-index="${index}"><span class="icon icon-trash"></span></button>
                    </div>
                </td>
            `;
            
            medicineTable.appendChild(row);
        });

        // Update quantity feature
        const updateButtons = document.querySelectorAll(".update-quantity-btn");
        updateButtons.forEach(button => {
            button.addEventListener("click", function() {
                const index = this.dataset.index;
                const inputEl = this.parentElement.querySelector(".quantity-input");
                const newQuantity = parseInt(inputEl.value);
                
                if (isNaN(newQuantity) || newQuantity < 1) {
                    inputEl.value = medicines[index].quantity; // Reset to previous value
                    showNotification("Please enter a valid quantity greater than 0", "warning");
                    return;
                }
                
                medicines[index].quantity = newQuantity;
                showNotification(`Quantity for ${medicines[index].name} updated successfully`, "success");
                displayMedicines();
                updateStats();
            });
        });

        // Delete medicine feature
        const deleteButtons = document.querySelectorAll(".delete-medicine-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", function() {
                const index = this.dataset.index;
                medicineIndexToDelete = index;
                medicineToDeleteSpan.textContent = medicines[index].name;
                deleteConfirmModal.classList.remove("hidden");
            });
        });
        
        // Update the statistics
        updateStats();
    }
    
    // Delete confirmation modal functionality
    confirmDeleteButton.addEventListener("click", function() {
        if (medicineIndexToDelete >= 0 && medicineIndexToDelete < medicines.length) {
            const medicineName = medicines[medicineIndexToDelete].name;
            medicines.splice(medicineIndexToDelete, 1);
            deleteConfirmModal.classList.add("hidden");
            displayMedicines();
            showNotification(`${medicineName} has been deleted successfully`, "info");
        }
    });
    
    cancelDeleteButton.addEventListener("click", function() {
        deleteConfirmModal.classList.add("hidden");
    });
    
    closeDeleteModal.addEventListener("click", function() {
        deleteConfirmModal.classList.add("hidden");
    });
    
    // Close modal when clicking outside
    deleteConfirmModal.addEventListener("click", function(event) {
        if (event.target === deleteConfirmModal) {
            deleteConfirmModal.classList.add("hidden");
        }
    });
    
    // Function to update statistics
    function updateStats() {
        // Total medicines
        totalMedicinesElement.textContent = medicines.length;
        
        // Total unique categories
        const categories = new Set();
        medicines.forEach(medicine => categories.add(medicine.category));
        totalCategoriesElement.textContent = categories.size;
        
        // Low stock items
        const lowStockCount = medicines.filter(medicine => medicine.quantity <= LOW_STOCK_THRESHOLD).length;
        lowStockElement.textContent = lowStockCount;
        
        // Add a visual indicator if there are low stock items
        if (lowStockCount > 0) {
            lowStockElement.classList.add("warning");
        } else {
            lowStockElement.classList.remove("warning");
        }
    }

    // Login function
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;

        if (users[email] && users[email].password === password) {
            loginPage.classList.add("hidden");
            homePage.classList.remove("hidden");
            displayMedicines();
            resetFormFields(loginForm);
            loginError.textContent = "";
        } else {
            loginError.textContent = "Invalid email or password.";
        }
    });

    // Sign up function
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("signup-email").value.trim().toLowerCase();
        const name = document.getElementById("signup-name").value.trim();
        const password = document.getElementById("signup-password").value;

        if (!email || !name || !password) {
            signupError.textContent = "All fields are required.";
            return;
        }

        if (!isStrongPassword(password)) {
            signupError.textContent = "Password must include uppercase, lowercase, number, and special character.";
            return;
        }

        if (users[email]) {
            signupError.textContent = "An account with this email already exists.";
            return;
        }

        users[email] = { name, password };
        signupError.textContent = "";
        resetFormFields(signupForm);
        showLoginForm();
        showNotification("Account created successfully. Please login.", "success");
    });

    // Add medicine functionality
    addMedicineButton.addEventListener("click", function () {
        resetFormFields(addMedicineForm);
        addMedicineModal.classList.remove("hidden");
        
        // Set default expiry date to 1 year from now
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        const defaultExpiry = oneYearFromNow.toISOString().split('T')[0];
        document.getElementById("medicine-expiry").value = defaultExpiry;
    });

    // Close modal
    closeModalButton.addEventListener("click", function () {
        addMedicineModal.classList.add("hidden");
    });
    
    // Cancel button in form
    cancelAddButton.addEventListener("click", function() {
        addMedicineModal.classList.add("hidden");
    });

    // Close modal when clicking outside
    addMedicineModal.addEventListener("click", function (event) {
        if (event.target === addMedicineModal) {
            addMedicineModal.classList.add("hidden");
        }
    });

    // Add medicine form submission
    addMedicineForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("medicine-name").value.trim();
        const category = document.getElementById("medicine-category").value.trim();
        const priceInput = parseFloat(document.getElementById("medicine-price").value);
        const quantityInput = parseInt(document.getElementById("medicine-quantity").value);
        const manufacturer = document.getElementById("medicine-manufacturer").value.trim();
        const expiry = document.getElementById("medicine-expiry").value;
        const unit = document.getElementById("medicine-unit").value;
        const description = document.getElementById("medicine-description").value.trim();

        // Basic validation
        if (name.length < 2) {
            alert("Medicine name must be at least 2 characters long");
            return;
        }

        if (isNaN(priceInput) || priceInput <= 0) {
            alert("Please enter a valid price greater than 0");
            return;
        }

        if (isNaN(quantityInput) || quantityInput <= 0) {
            alert("Please enter a valid quantity greater than 0");
            return;
        }

        const today = new Date();
        const expiryDate = new Date(expiry);
        if (expiryDate <= today) {
            alert("Expiry date must be in the future");
            return;
        }

        // Add the medicine
        medicines.push({ 
            name, 
            category, 
            price: priceInput, 
            quantity: quantityInput, 
            manufacturer, 
            expiry, 
            unit, 
            description 
        });
        
        displayMedicines();
        addMedicineModal.classList.add("hidden");
        resetFormFields(addMedicineForm);
        
        // Show success message
        showNotification(`${name} has been added successfully!`, 'success');
    });

    // Keyboard escape to close modal
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            if (!addMedicineModal.classList.contains("hidden")) {
                addMedicineModal.classList.add("hidden");
            }
            if (!deleteConfirmModal.classList.contains("hidden")) {
                deleteConfirmModal.classList.add("hidden");
            }
        }
    });

    // Logout functionality
    logoutButton.addEventListener("click", function () {
        loginPage.classList.remove("hidden");
        homePage.classList.add("hidden");
        resetFormFields(loginForm);
    });
    
    // Function to show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Determine icon based on type
        let iconClass = '';
        if (type === 'success') {
            iconClass = 'icon-check-circle';
        } else if (type === 'warning') {
            iconClass = 'icon-warning';
        } else {
            iconClass = 'icon-info-circle';
        }

        notification.innerHTML = `
            <div class="notification-content">
                <span class="icon ${iconClass}"></span>
                <p>${message}</p>
            </div>
            <button class="notification-close"><span class="icon icon-close"></span></button>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
});
