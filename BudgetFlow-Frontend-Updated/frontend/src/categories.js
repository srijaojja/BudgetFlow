
/* ========================================
   BUDGETFLOW CATEGORY GROUPS
======================================== */

export const CATEGORY_GROUPS = {
    "Food & Drinks": [
        "Groceries",
        "Restaurants",
        "Fast Food",
        "Coffee",
        "Tea",
        "Snacks",
        "Food Delivery",
        "Bakery",
        "Dining Out",
        "Office Lunch",
        "Sweets",
        "Beverages"
    ],

    "Housing": [
        "Rent",
        "Home Loan",
        "Maintenance",
        "Furniture",
        "Home Decor",
        "Home Repairs",
        "Cleaning",
        "Property Tax",
        "Household Supplies"
    ],

    "Bills & Utilities": [
        "Electricity",
        "Water",
        "Gas",
        "Internet",
        "Mobile Recharge",
        "Telephone",
        "DTH",
        "Subscriptions",
        "Streaming",
        "Cloud Storage",
        "Software"
    ],

    "Transportation": [
        "Petrol",
        "Diesel",
        "Public Transport",
        "Bus",
        "Metro",
        "Train",
        "Taxi",
        "Auto Rickshaw",
        "Cab",
        "Parking",
        "Tolls",
        "Vehicle Maintenance"
    ],

    "Shopping": [
        "Clothing",
        "Footwear",
        "Accessories",
        "Electronics",
        "Gadgets",
        "Online Shopping",
        "Personal Care"
    ],

    "Health": [
        "Doctor",
        "Medicines",
        "Hospital",
        "Dental",
        "Fitness",
        "Gym",
        "Health Insurance"
    ],

    "Education": [
        "Tuition",
        "Books",
        "Courses",
        "College",
        "School Fees",
        "Stationery"
    ],

    "Entertainment": [
        "Movies",
        "Gaming",
        "Events",
        "Hobbies",
        "Music",
        "Outings"
    ],

    "Travel": [
        "Flights",
        "Hotels",
        "Vacation",
        "Sightseeing",
        "Travel Food"
    ],

    "Finance": [
        "Bank Charges",
        "Loan EMI",
        "Interest",
        "Taxes",
        "Investments"
    ],

    "Other": [
        "Gifts",
        "Donations",
        "Miscellaneous"
    ],

    /* ========================================
       SOURCES OF INCOME
    ======================================== */

    "Income": [
        "Salary",
        "Freelancing",
        "Business Income",
        "Part-Time Job",
        "Bonus",
        "Commission",
        "Rental Income",
        "Interest Income",
        "Dividends",
        "Investment Returns",
        "Gifts Received",
        "Pension",
        "Government Benefits",
        "Refunds",
        "Other Income"
    ]
};

/* ========================================
   INCOME CATEGORIES
======================================== */

export const INCOME_CATEGORIES = [
    ...CATEGORY_GROUPS.Income
];

/* ========================================
   EXPENSE CATEGORIES
======================================== */

export const EXPENSE_CATEGORIES = Object.entries(
    CATEGORY_GROUPS
)
    .filter(([groupName]) => groupName !== "Income")
    .flatMap(([, categories]) => categories);

/* ========================================
   ALL CATEGORIES
======================================== */

export const ALL_CATEGORIES = [
    ...INCOME_CATEGORIES,
    ...EXPENSE_CATEGORIES
];
