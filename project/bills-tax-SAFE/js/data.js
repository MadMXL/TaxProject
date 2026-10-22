// ═══════════════════════════════════════════════════════════════
// Seed data — realistic Thai SME billing records.
// VAT is a flat 7%; every subtotal/tax/total below is exact to 2dp.
// Live data overrides this on load (localStorage → Firebase).
// ═══════════════════════════════════════════════════════════════
let quotations = [
    {
        id: 'DOC-2026-0913', date: '2026-09-15',
        customer: 'หจก. รุ่งเรืองพาณิชย์', customerEmail: 'rungrueang.trade@gmail.com',
        taxId: '0-2033-45009-12-7', docType: 'bill',
        items: [{ name: 'ค่าที่ปรึกษาโครงการ', description: 'สำรวจหน้างานและประเมินแบบ', qty: 4, price: 1500 }],
        subtotal: 6000, tax: 420, total: 6420,
        status: 'draft', createdBy: 'somying@baigamgab.co'
    },
    {
        id: 'DOC-2026-0912', date: '2026-09-13',
        customer: 'บริษัท ศิริวัฒน์ก่อสร้าง จำกัด', customerEmail: 'contact@siriwat.co.th',
        taxId: '0-1055-48012-34-5', docType: 'tax-invoice',
        items: [{ name: 'งานเชื่อมโครงเหล็กอาคารโกดัง', description: 'ช่วงเสา 6 ต้น พร้อมค้ำยัน', qty: 1, price: 45000 }],
        subtotal: 45000, tax: 3150, total: 48150,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-09-13T02:15:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-09-13T02:42:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0911', date: '2026-09-12',
        customer: 'บริษัท ทีเอ็นอาร์ เอ็นจิเนียริ่ง จำกัด', customerEmail: 'acct@tnr-eng.com',
        taxId: '0-1055-52007-88-1', docType: 'invoice',
        items: [
            { name: 'งานบำรุงรักษาเครื่องจักร', description: 'บำรุงรักษาเชิงป้องกัน 1 ครั้ง', qty: 1, price: 20000 },
            { name: 'อะไหล่ปั๊มน้ำหล่อเย็น', description: 'ชุดซีลและใบพัด', qty: 1, price: 5000 }
        ],
        subtotal: 25000, tax: 1750, total: 26750,
        status: 'pending', createdBy: 'anucha@baigamgab.co',
        submittedAt: '2026-09-12T07:05:00.000Z', submittedBy: 'anucha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0910', date: '2026-09-11',
        customer: 'หจก. รุ่งเรืองพาณิชย์', customerEmail: 'rungrueang.trade@gmail.com',
        taxId: '0-2033-45009-12-7', docType: 'bill',
        items: [{ name: 'ค่าที่ปรึกษาโครงการ', description: 'ให้คำปรึกษา 6 ชั่วโมง', qty: 6, price: 1500 }],
        subtotal: 9000, tax: 630, total: 9630,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-09-11T03:20:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-09-11T04:00:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0909', date: '2026-09-10',
        customer: 'บริษัท เอเชีย เมทัลเวิร์ค จำกัด', customerEmail: 'purchasing@asiametalworks.co.th',
        taxId: '0-1155-49006-55-3', docType: 'tax-invoice',
        items: [
            { name: 'งานติดตั้งระบบไฟฟ้าโรงงาน', description: 'เดินระบบเมนและไลน์การผลิต', qty: 1, price: 90000 },
            { name: 'ตู้ควบคุมไฟฟ้า (MDB)', description: 'ตู้เมนพร้อมเบรกเกอร์', qty: 1, price: 15000 },
            { name: 'สายไฟและอุปกรณ์ประกอบ', description: 'สาย THW, ราง, ท่อร้อยสาย', qty: 1, price: 5000 }
        ],
        subtotal: 110000, tax: 7700, total: 117700,
        status: 'pending', createdBy: 'anucha@baigamgab.co',
        submittedAt: '2026-09-10T08:30:00.000Z', submittedBy: 'anucha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0908', date: '2026-09-09',
        customer: 'คุณสมชาย รัตนพงษ์', customerEmail: 'somchai.r@outlook.co.th',
        taxId: '', docType: 'invoice',
        items: [{ name: 'ค่าออกแบบและเขียนแบบ', description: 'แบบต่อเติมโรงจอดรถ', qty: 1, price: 5000 }],
        subtotal: 5000, tax: 350, total: 5350,
        status: 'rejected', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-09-09T01:10:00.000Z', submittedBy: 'somying@baigamgab.co',
        rejectedAt: '2026-09-09T01:50:00.000Z', rejectedBy: 'thanakorn@baigamgab.co',
        rejectionReason: 'ราคาต่อหน่วยไม่ตรงกับใบเสนอราคาที่ตกลงไว้'
    },
    {
        id: 'DOC-2026-0807', date: '2026-08-22',
        customer: 'บริษัท ศิริวัฒน์ก่อสร้าง จำกัด', customerEmail: 'contact@siriwat.co.th',
        taxId: '0-1055-48012-34-5', docType: 'tax-invoice',
        items: [{ name: 'งานเทพื้นคอนกรีตเสริมเหล็ก', description: 'พื้นโรงงาน 400 ตร.ม. หนา 15 ซม.', qty: 1, price: 120000 }],
        subtotal: 120000, tax: 8400, total: 128400,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-08-22T02:00:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-08-22T06:15:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0806', date: '2026-08-08',
        customer: 'บริษัท เอเชีย เมทัลเวิร์ค จำกัด', customerEmail: 'purchasing@asiametalworks.co.th',
        taxId: '0-1155-49006-55-3', docType: 'invoice',
        items: [{ name: 'งานกลึงชิ้นส่วนโลหะ', description: 'ชิ้นงานตามแบบ 200 ชิ้น', qty: 200, price: 250 }],
        subtotal: 50000, tax: 3500, total: 53500,
        status: 'approved', createdBy: 'anucha@baigamgab.co',
        submittedAt: '2026-08-08T03:30:00.000Z', submittedBy: 'anucha@baigamgab.co',
        approvedAt: '2026-08-08T04:10:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0705', date: '2026-07-18',
        customer: 'หจก. รุ่งเรืองพาณิชย์', customerEmail: 'rungrueang.trade@gmail.com',
        taxId: '0-2033-45009-12-7', docType: 'bill',
        items: [{ name: 'ค่าบริการซ่อมบำรุงรายเดือน', description: 'สัญญาดูแลระบบ เดือนกรกฎาคม', qty: 1, price: 8000 }],
        subtotal: 8000, tax: 560, total: 8560,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-07-18T02:00:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-07-18T03:00:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0704', date: '2026-07-05',
        customer: 'บริษัท ทีเอ็นอาร์ เอ็นจิเนียริ่ง จำกัด', customerEmail: 'acct@tnr-eng.com',
        taxId: '0-1055-52007-88-1', docType: 'tax-invoice',
        items: [
            { name: 'งานออกแบบระบบระบายอากาศ', description: 'คำนวณโหลดและวางผังท่อ', qty: 1, price: 35000 },
            { name: 'ค่าติดตั้งพัดลมอุตสาหกรรม', description: 'พัดลมโรงงาน 4 ชุด', qty: 4, price: 12000 }
        ],
        subtotal: 83000, tax: 5810, total: 88810,
        status: 'approved', createdBy: 'anucha@baigamgab.co',
        submittedAt: '2026-07-05T04:00:00.000Z', submittedBy: 'anucha@baigamgab.co',
        approvedAt: '2026-07-05T07:30:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0603', date: '2026-06-20',
        customer: 'บริษัท ศิริวัฒน์ก่อสร้าง จำกัด', customerEmail: 'contact@siriwat.co.th',
        taxId: '0-1055-48012-34-5', docType: 'invoice',
        items: [{ name: 'งานก่อสร้างรั้วคอนกรีตสำเร็จรูป', description: 'รั้วรอบโครงการ ยาว 180 เมตร', qty: 1, price: 65000 }],
        subtotal: 65000, tax: 4550, total: 69550,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-06-20T02:00:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-06-20T05:00:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0502', date: '2026-05-14',
        customer: 'คุณสมชาย รัตนพงษ์', customerEmail: 'somchai.r@outlook.co.th',
        taxId: '', docType: 'bill',
        items: [{ name: 'ค่าที่ปรึกษาโครงการ', description: 'ตรวจแบบและประเมินราคา', qty: 2, price: 1500 }],
        subtotal: 3000, tax: 210, total: 3210,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-05-14T02:00:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-05-14T02:40:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0401', date: '2026-04-09',
        customer: 'บริษัท เอเชีย เมทัลเวิร์ค จำกัด', customerEmail: 'purchasing@asiametalworks.co.th',
        taxId: '0-1155-49006-55-3', docType: 'tax-invoice',
        items: [{ name: 'งานเชื่อมประกอบโครงสร้างเหล็ก', description: 'โครงหลังคาคลุมลานสินค้า', qty: 1, price: 78000 }],
        subtotal: 78000, tax: 5460, total: 83460,
        status: 'approved', createdBy: 'anucha@baigamgab.co',
        submittedAt: '2026-04-09T03:00:00.000Z', submittedBy: 'anucha@baigamgab.co',
        approvedAt: '2026-04-09T06:00:00.000Z', approvedBy: 'preecha@baigamgab.co'
    },
    {
        id: 'DOC-2026-0312', date: '2026-03-15',
        customer: 'บริษัท ทีเอ็นอาร์ เอ็นจิเนียริ่ง จำกัด', customerEmail: 'acct@tnr-eng.com',
        taxId: '0-1055-52007-88-1', docType: 'invoice',
        items: [{ name: 'งานปรับปรุงระบบไฟฟ้าสำนักงาน', description: 'เปลี่ยนตู้โหลดและเดินสายใหม่', qty: 1, price: 42000 }],
        subtotal: 42000, tax: 2940, total: 44940,
        status: 'approved', createdBy: 'somying@baigamgab.co',
        submittedAt: '2026-03-15T02:00:00.000Z', submittedBy: 'somying@baigamgab.co',
        approvedAt: '2026-03-15T04:30:00.000Z', approvedBy: 'preecha@baigamgab.co'
    }
];

// Customer database
let customers = [
    {
        id: 'CUST001',
        name: 'บริษัท ศิริวัฒน์ก่อสร้าง จำกัด',
        email: 'contact@siriwat.co.th',
        phone: '02-434-5566',
        address: '88/12 ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150',
        taxId: '0-1055-48012-34-5',
        type: 'company'
    },
    {
        id: 'CUST002',
        name: 'บริษัท ทีเอ็นอาร์ เอ็นจิเนียริ่ง จำกัด',
        email: 'acct@tnr-eng.com',
        phone: '02-712-8890',
        address: '159 อาคารทีเอ็นอาร์ ถนนสุขุมวิท 26 แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110',
        taxId: '0-1055-52007-88-1',
        type: 'company'
    },
    {
        id: 'CUST003',
        name: 'หจก. รุ่งเรืองพาณิชย์',
        email: 'rungrueang.trade@gmail.com',
        phone: '038-221-447',
        address: '45/7 หมู่ 3 ตำบลบ้านสวน อำเภอเมืองชลบุรี ชลบุรี 20000',
        taxId: '0-2033-45009-12-7',
        type: 'company'
    },
    {
        id: 'CUST004',
        name: 'บริษัท เอเชีย เมทัลเวิร์ค จำกัด',
        email: 'purchasing@asiametalworks.co.th',
        phone: '02-901-2233',
        address: '222 นิคมอุตสาหกรรมบางปู ซอย 12 ตำบลบางปูใหม่ อำเภอเมืองสมุทรปราการ สมุทรปราการ 10280',
        taxId: '0-1155-49006-55-3',
        type: 'company'
    },
    {
        id: 'CUST005',
        name: 'คุณสมชาย รัตนพงษ์',
        email: 'somchai.r@outlook.co.th',
        phone: '081-234-5678',
        address: '73 ซอยลาดพร้าว 71 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230',
        taxId: '',
        type: 'individual'
    }
];

// Product/Service catalog
let products = [
    {
        id: 'PROD001',
        name: 'งานติดตั้งระบบไฟฟ้า',
        description: 'ติดตั้งระบบไฟฟ้าโรงงานและอาคาร',
        price: 90000,
        unit: 'งาน'
    },
    {
        id: 'PROD002',
        name: 'ค่าที่ปรึกษาโครงการ',
        description: 'ที่ปรึกษาด้านวิศวกรรม คิดตามชั่วโมง',
        price: 1500,
        unit: 'ชั่วโมง'
    },
    {
        id: 'PROD003',
        name: 'งานเชื่อมโครงเหล็ก',
        description: 'เชื่อมประกอบโครงสร้างเหล็กตามแบบ',
        price: 45000,
        unit: 'งาน'
    },
    {
        id: 'PROD004',
        name: 'ค่าออกแบบและเขียนแบบ',
        description: 'ออกแบบและเขียนแบบวิศวกรรม',
        price: 5000,
        unit: 'งาน'
    },
    {
        id: 'PROD005',
        name: 'งานบำรุงรักษาเครื่องจักร',
        description: 'บำรุงรักษาเชิงป้องกันรายครั้ง',
        price: 20000,
        unit: 'ครั้ง'
    }
];

let currentView = 'dashboard';
let billViewMode = 'list'; // 'list', 'date', 'customer'
let statusFilter = 'all'; // 'all', 'draft', 'pending', 'approved', 'rejected'
let searchQuery = ''; // search text in bills view
let adminTab = 'team'; // 'team', 'company', 'audit', 'archive' — Admin section subtab

// Extra filters per list. They combine (AND) with each other, the status chips
// and the search box, e.g. customer = X and date between 1–30 Sep.
const listFilters = {
    bills: { name: '', from: '', to: '', docType: '' },  // name = customer
    po:    { name: '', from: '', to: '' },               // name = customer
    mat:   { name: '', from: '', to: '' },               // name = supplier
};

// ── PURCHASE ORDERS ──────────────────────────────────────────
let purchaseOrders = [];
let poStatusFilter = 'all'; // 'all', 'open', 'in-progress', 'completed'
let poSearchQuery = '';
let groupBy = 'date';

const companyInfo = {
    name: 'บริษัท ภูธการช่าง จำกัด',
    address: '245 ซอยภูธร ถนนระนอง ตำบลตลาดเหนือ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000',
    phone: '076-213-660',
    email: 'macmaruay@gmail.com',
    taxId: '3 8399 00123 24',
    website: 'www.baigamgab.co',
    _seed: 2   // bump when these defaults change — stale localStorage below this is ignored
};



// ── COST TRACKING ─────────────────────────────────────────────
let poCosts = [];          // cost entries per PO
let materialPrices = [];   // material cost per supplier records
let matSearchQuery = '';   // search in material costs tab
