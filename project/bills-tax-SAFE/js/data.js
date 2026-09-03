let quotations = [
    {
        id: 'QT20260113001',
        date: '2026-01-13',
        customer: 'บริษัท มีนาคาร์น จำกัด',
        taxId: 'TX-458789012',
        docType: 'tax-invoice',
        items: [{name: 'เขื่อนหมุน', qty: 1, price: 5000}],
        subtotal: 5000,
        tax: 350,
        total: 5350,
        status: 'approved'
    },
    {
        id: 'QT20260113002',
        date: '2026-01-13',
        customer: 'บริษัท มีนาคาร์น จำกัด',
        taxId: 'TX-458789012',
        docType: 'invoice',
        items: [{name: 'ตั้งเมตรคูน', qty: 40, price: 150}],
        subtotal: 6000,
        tax: 420,
        total: 6420,
        status: 'approved'
    },
    {
        id: 'QT20260113003',
        date: '2026-01-13',
        customer: 'นาย ช้างA',
        taxId: 'TX-123456789',
        docType: 'bill',
        items: [{name: 'Software License', qty: 1, price: 2996}],
        subtotal: 2996,
        tax: 209.72,
        total: 3205.72,
        status: 'pending'
    },
    {
        id: 'QT20260101001',
        date: '2026-01-01',
        customer: 'บริษัท มีนาคาร์น จำกัด',
        taxId: 'TX-458789012',
        docType: 'tax-invoice',
        items: [{name: 'คำเขื่อมก่อนขาขวัด', qty: 1, price: 2800}],
        subtotal: 2800,
        tax: 196,
        total: 2996,
        status: 'approved'
    },
    {
        id: 'QT20260116001',
        date: '2026-01-16',
        customer: 'บริษัท มีนาคาร์น จำกัด',
        taxId: 'TX-458789012',
        docType: 'invoice',
        items: [{name: 'คำเขื่อมทองหงวัด', qty: 1, price: 2675}],
        subtotal: 2675,
        tax: 187.25,
        total: 2862.25,
        status: 'approved'
    },
    {
        id: 'QT20251215001',
        date: '2025-12-15',
        customer: 'บริษัท มีนาคาร์น จำกัด',
        taxId: 'TX-458789012',
        docType: 'bill',
        items: [{name: 'Consulting Service', qty: 1, price: 267.5}],
        subtotal: 267.5,
        tax: 18.725,
        total: 286.225,
        status: 'approved'
    }
];

// Customer database
let customers = [
    {
        id: 'CUST001',
        name: 'บริษัท มีนาคาร์น จำกัด',
        email: 'contact@meenakarn.com',
        phone: '02-123-4567',
        address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        taxId: 'TX-458789012',
        type: 'company'
    },
    {
        id: 'CUST002',
        name: 'นาย ช้างA',
        email: 'chang@example.com',
        phone: '08-1234-5678',
        address: '456 ถนนพระราม 4 กรุงเทพฯ',
        taxId: 'TX-123456789',
        type: 'individual'
    },
    {
        id: 'CUST003',
        name: 'Zuzu',
        email: 'zuzu@example.com',
        phone: '09-8765-4321',
        address: '789 Silom Road, Bangkok',
        taxId: '',
        type: 'individual'
    }
];

// Product/Service catalog
let products = [
    {
        id: 'PROD001',
        name: 'Website Development',
        description: 'Full website design and development',
        price: 15000,
        unit: 'project'
    },
    {
        id: 'PROD002',
        name: 'Consulting Service',
        description: 'Business consulting per hour',
        price: 1500,
        unit: 'hour'
    },
    {
        id: 'PROD003',
        name: 'Software License',
        description: 'Annual software license',
        price: 5000,
        unit: 'license'
    }
];

let currentView = 'dashboard';
let billViewMode = 'list'; // 'list', 'date', 'customer'
let statusFilter = 'all'; // 'all', 'draft', 'pending', 'approved', 'rejected'
let searchQuery = ''; // search text in bills view

// ── PURCHASE ORDERS ──────────────────────────────────────────
let purchaseOrders = [];
let poStatusFilter = 'all'; // 'all', 'open', 'in-progress', 'completed'
let poSearchQuery = '';
let groupBy = 'date';

const companyInfo = {
    name: 'Baigamgab Co., Ltd.',
    address: '123 Business Street, Bangkok 10110',
    phone: '+66 2-123-4567',
    email: 'contact@baigamgab.co',
    taxId: 'TX-9876543210',
    website: 'www.baigamgab.co'
};



// ── COST TRACKING ─────────────────────────────────────────────
let poCosts = [];          // cost entries per PO
let materialPrices = [];   // material cost per supplier records
let matSearchQuery = '';   // search in material costs tab
