# SariPh: Local Retail Point of Sale (POS) System

---

👥 The Dream Team
Aljecera, Angel Mae
Aljo, Stephanie
Almajeda, Wesley
Almonte, Renz Policarp
Alotencio, Mary Claire

---

## 📂 Project Structure
```text
src/
├── components/   # Shared UI (Navbar, Buttons)
├── context/      # Auth & Cart Logic
├── pages/        # Login, POS, and Dashboard views
├── services/     # Mock API / Data handling
└── utils/        # Discount & Math logic

Member 1 – Product Management
Handles:
Add product


Update product


Deactivate product


Search product
Here yung mga sample files:
ProductController
ProductModel
product_view

Member 2 – User Management
Handles:
Login system


User roles


Add users


Assign roles
Roles:
Cashier


Supervisor


Administrator



Member 3 – Sales Transaction
Handles:
Scan/select product


Add items to cart


Calculate totals


Process payment


Generate receipt
Member 4 – Discounts
Handles:
Senior Citizen


PWD


Athlete


Solo Parent
Rules:
Only one discount per transaction


Display on receipt


Validate eligibility
Member 5 – Voids, Cancellation & Reprinting
Handles:
Void item


Cancel transaction


Post-void (Supervisor approval)


Reprint receipt


Audit logs



