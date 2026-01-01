import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Play, Heart, ShoppingCart, Filter, Search,
  GraduationCap, Stethoscope, Utensils, Hotel, Home, Car, Plane,
  CreditCard, Factory, Users, Truck, Building, BookOpen, FlaskConical,
  Phone, Pill, Package, MapPin, Star, Award, CheckCircle, Wallet, Landmark,
  FileText, Calculator, Receipt, PieChart, ClipboardCheck, Coins, Target,
  TrendingUp, Megaphone, Share2, Mail, Zap, BarChart3, UserCheck, DollarSign,
  Clock, Calendar, Briefcase, UserCog, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import softwareValaLogo from "@/assets/software-vala-logo.jpg";

interface Demo {
  id: string;
  name: string;
  category: string;
  masterCategory: string;
  description: string;
  url: string;
  icon: any;
  status: "ACTIVE" | "COMING_SOON";
  features: string[];
  frontend: string[];
  backend: string[];
  color: string;
  price: string;
  discountPrice: string;
}

const allDemos: Demo[] = [
  // ============= 1. EDUCATION & ELEARNING (7 Sub-categories) =============
  {
    id: "school-management",
    name: "School Management Software",
    category: "School Management",
    masterCategory: "Education & eLearning",
    description: "Complete school management with student records, attendance, timetable, and parent communication.",
    url: "/demo/school-management",
    icon: GraduationCap,
    status: "ACTIVE",
    features: ["Student Records", "Attendance", "Timetable", "Parent Portal"],
    frontend: ["React", "TypeScript", "Education UI"],
    backend: ["Node.js", "PostgreSQL", "SMS API"],
    color: "from-blue-600 to-indigo-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },
  {
    id: "college-erp",
    name: "College / University ERP",
    category: "College ERP",
    masterCategory: "Education & eLearning",
    description: "University ERP with admission, courses, faculty, exams, and placement management.",
    url: "/demo/college-erp",
    icon: Building,
    status: "ACTIVE",
    features: ["Admissions", "Course Mgmt", "Faculty Portal", "Placements"],
    frontend: ["React", "TypeScript", "Dashboard UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-indigo-600 to-purple-600",
    price: "₹89,999",
    discountPrice: "₹53,999"
  },
  {
    id: "lms",
    name: "Learning Management System",
    category: "LMS",
    masterCategory: "Education & eLearning",
    description: "Complete LMS with courses, videos, quizzes, certificates, and progress tracking.",
    url: "/demo/lms",
    icon: BookOpen,
    status: "ACTIVE",
    features: ["Video Courses", "Quizzes", "Certificates", "Progress Track"],
    frontend: ["React", "TypeScript", "Video Player"],
    backend: ["Node.js", "PostgreSQL", "CDN"],
    color: "from-purple-600 to-pink-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "coaching-institute",
    name: "Coaching / Institute Management",
    category: "Coaching",
    masterCategory: "Education & eLearning",
    description: "Coaching center management with batch scheduling, test series, and performance analytics.",
    url: "#",
    icon: Users,
    status: "COMING_SOON",
    features: ["Batch Schedule", "Test Series", "Performance", "Fee Mgmt"],
    frontend: ["React", "TypeScript", "Analytics UI"],
    backend: ["Node.js", "PostgreSQL", "Reports"],
    color: "from-cyan-600 to-blue-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "online-exam",
    name: "Online Examination System",
    category: "Online Exam",
    masterCategory: "Education & eLearning",
    description: "Online exam platform with question banks, proctoring, auto-grading, and result analytics.",
    url: "#",
    icon: FlaskConical,
    status: "COMING_SOON",
    features: ["Question Bank", "Proctoring", "Auto-Grade", "Analytics"],
    frontend: ["React", "TypeScript", "Exam UI"],
    backend: ["Node.js", "PostgreSQL", "AI Proctor"],
    color: "from-green-600 to-teal-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "student-info",
    name: "Student Information System",
    category: "Student Info",
    masterCategory: "Education & eLearning",
    description: "Centralized student database with academic records, documents, and communication.",
    url: "#",
    icon: UserCheck,
    status: "COMING_SOON",
    features: ["Student DB", "Academic Records", "Documents", "Communication"],
    frontend: ["React", "TypeScript", "Data Grid"],
    backend: ["Node.js", "PostgreSQL", "Cloud Storage"],
    color: "from-blue-500 to-cyan-500",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "edu-fees",
    name: "Fees & Accounting for Education",
    category: "Education Fees",
    masterCategory: "Education & eLearning",
    description: "Education-focused fee collection, receipts, dues tracking, and financial reports.",
    url: "#",
    icon: Calculator,
    status: "COMING_SOON",
    features: ["Fee Collection", "Receipts", "Due Tracking", "Reports"],
    frontend: ["React", "TypeScript", "Finance UI"],
    backend: ["Node.js", "PostgreSQL", "Payment Gateway"],
    color: "from-emerald-600 to-green-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },

  // ============= 2. RETAIL & POS SYSTEMS (7 Sub-categories) =============
  {
    id: "retail-pos",
    name: "Retail POS",
    category: "Retail POS",
    masterCategory: "Retail & POS Systems",
    description: "Complete retail POS with barcode scanning, inventory, billing, and sales reports.",
    url: "/demo/retail-pos",
    icon: ShoppingCart,
    status: "ACTIVE",
    features: ["Barcode Scan", "Inventory", "Billing", "Sales Reports"],
    frontend: ["React", "TypeScript", "POS UI"],
    backend: ["Node.js", "PostgreSQL", "Print API"],
    color: "from-orange-600 to-red-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "restaurant-pos",
    name: "Restaurant POS",
    category: "Restaurant POS",
    masterCategory: "Retail & POS Systems",
    description: "Restaurant POS with table management, KOT, billing, and kitchen display system.",
    url: "/demo/restaurant-pos",
    icon: Utensils,
    status: "ACTIVE",
    features: ["Table Mgmt", "KOT System", "Billing", "Kitchen Display"],
    frontend: ["React", "TypeScript", "Restaurant UI"],
    backend: ["Node.js", "PostgreSQL", "Real-time"],
    color: "from-red-600 to-orange-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "grocery-pos",
    name: "Grocery / Supermarket POS",
    category: "Grocery POS",
    masterCategory: "Retail & POS Systems",
    description: "Supermarket POS with weighing scale integration, loyalty, and express checkout.",
    url: "#",
    icon: Package,
    status: "COMING_SOON",
    features: ["Scale Integration", "Loyalty", "Express", "Stock Alerts"],
    frontend: ["React", "TypeScript", "Grocery UI"],
    backend: ["Node.js", "PostgreSQL", "Hardware API"],
    color: "from-green-600 to-emerald-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "mobile-pos",
    name: "Mobile POS",
    category: "Mobile POS",
    masterCategory: "Retail & POS Systems",
    description: "Mobile-first POS for on-the-go sales, delivery, and outdoor events.",
    url: "#",
    icon: Phone,
    status: "COMING_SOON",
    features: ["Mobile App", "Offline Mode", "QR Pay", "GPS Track"],
    frontend: ["React Native", "TypeScript", "Mobile UI"],
    backend: ["Node.js", "PostgreSQL", "Sync API"],
    color: "from-blue-600 to-purple-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "multistore-pos",
    name: "Multi-Store POS",
    category: "Multi-Store POS",
    masterCategory: "Retail & POS Systems",
    description: "Chain store POS with centralized inventory, pricing, and consolidated reports.",
    url: "#",
    icon: Building,
    status: "COMING_SOON",
    features: ["Central Inventory", "Store Sync", "Pricing", "Reports"],
    frontend: ["React", "TypeScript", "Enterprise UI"],
    backend: ["Node.js", "PostgreSQL", "Multi-tenant"],
    color: "from-purple-600 to-indigo-600",
    price: "₹79,999",
    discountPrice: "₹47,999"
  },
  {
    id: "inventory-stock",
    name: "Inventory & Stock Management",
    category: "Inventory",
    masterCategory: "Retail & POS Systems",
    description: "Inventory control with stock levels, reorder alerts, and supplier management.",
    url: "#",
    icon: Package,
    status: "COMING_SOON",
    features: ["Stock Levels", "Reorder Alerts", "Suppliers", "Warehouses"],
    frontend: ["React", "TypeScript", "Inventory UI"],
    backend: ["Node.js", "PostgreSQL", "Barcode API"],
    color: "from-teal-600 to-cyan-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "billing-invoicing",
    name: "Billing & Invoicing",
    category: "Billing",
    masterCategory: "Retail & POS Systems",
    description: "Professional billing with GST, invoices, quotations, and payment tracking.",
    url: "#",
    icon: Receipt,
    status: "COMING_SOON",
    features: ["GST Billing", "Invoices", "Quotations", "Payments"],
    frontend: ["React", "TypeScript", "Invoice UI"],
    backend: ["Node.js", "PostgreSQL", "PDF API"],
    color: "from-amber-600 to-orange-600",
    price: "₹29,999",
    discountPrice: "₹17,999"
  },

  // ============= 3. HEALTHCARE & MEDICAL SYSTEMS (7 Sub-categories) =============
  {
    id: "hospital-hms",
    name: "Hospital Management System",
    category: "Hospital HMS",
    masterCategory: "Healthcare & Medical Systems",
    description: "Complete HMS with IPD, OPD, surgery, nursing, and department management.",
    url: "/demo/hospital-hms",
    icon: Building,
    status: "ACTIVE",
    features: ["IPD/OPD", "Surgery", "Nursing", "Departments"],
    frontend: ["React", "TypeScript", "Medical UI"],
    backend: ["Node.js", "PostgreSQL", "HL7 FHIR"],
    color: "from-emerald-600 to-teal-600",
    price: "₹99,999",
    discountPrice: "₹59,999"
  },
  {
    id: "clinic-management",
    name: "Clinic Management Software",
    category: "Clinic",
    masterCategory: "Healthcare & Medical Systems",
    description: "Clinic software with patient records, prescriptions, billing, and scheduling.",
    url: "/demo/clinic",
    icon: Stethoscope,
    status: "ACTIVE",
    features: ["Patient Records", "Prescriptions", "Billing", "Schedule"],
    frontend: ["React", "TypeScript", "Healthcare UI"],
    backend: ["Node.js", "PostgreSQL", "SMS API"],
    color: "from-teal-600 to-cyan-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "pharmacy-management",
    name: "Pharmacy Management",
    category: "Pharmacy",
    masterCategory: "Healthcare & Medical Systems",
    description: "Pharmacy software with drug inventory, expiry tracking, billing, and prescriptions.",
    url: "#",
    icon: Pill,
    status: "COMING_SOON",
    features: ["Drug Inventory", "Expiry Track", "Billing", "Prescriptions"],
    frontend: ["React", "TypeScript", "Pharmacy UI"],
    backend: ["Node.js", "PostgreSQL", "Drug DB"],
    color: "from-green-600 to-emerald-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "lab-management",
    name: "Laboratory Management System",
    category: "Lab LIMS",
    masterCategory: "Healthcare & Medical Systems",
    description: "LIMS with test management, sample tracking, report generation, and integration.",
    url: "#",
    icon: FlaskConical,
    status: "COMING_SOON",
    features: ["Test Mgmt", "Sample Track", "Reports", "Integration"],
    frontend: ["React", "TypeScript", "Lab UI"],
    backend: ["Node.js", "PostgreSQL", "HL7"],
    color: "from-purple-600 to-indigo-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "telemedicine",
    name: "Telemedicine Platform",
    category: "Telemedicine",
    masterCategory: "Healthcare & Medical Systems",
    description: "Video consultation platform with scheduling, prescriptions, and payments.",
    url: "#",
    icon: Phone,
    status: "COMING_SOON",
    features: ["Video Call", "Scheduling", "E-Prescription", "Payments"],
    frontend: ["React", "TypeScript", "Video UI"],
    backend: ["Node.js", "PostgreSQL", "WebRTC"],
    color: "from-blue-600 to-cyan-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking System",
    category: "Appointments",
    masterCategory: "Healthcare & Medical Systems",
    description: "Healthcare appointment system with doctor schedules, reminders, and queue management.",
    url: "#",
    icon: Calendar,
    status: "COMING_SOON",
    features: ["Doctor Schedule", "Reminders", "Queue Mgmt", "Check-in"],
    frontend: ["React", "TypeScript", "Booking UI"],
    backend: ["Node.js", "PostgreSQL", "SMS/Email"],
    color: "from-indigo-600 to-blue-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },
  {
    id: "medical-records",
    name: "Medical Records Management",
    category: "EMR",
    masterCategory: "Healthcare & Medical Systems",
    description: "Electronic medical records with patient history, documents, and secure sharing.",
    url: "#",
    icon: FileText,
    status: "COMING_SOON",
    features: ["Patient History", "Documents", "Secure Share", "Analytics"],
    frontend: ["React", "TypeScript", "EMR UI"],
    backend: ["Node.js", "PostgreSQL", "Encryption"],
    color: "from-rose-600 to-pink-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },

  // ============= 4. LOGISTICS & TRANSPORTATION (7 Sub-categories) =============
  {
    id: "fleet-management",
    name: "Fleet Management System",
    category: "Fleet",
    masterCategory: "Logistics & Transportation",
    description: "Fleet management with vehicle tracking, maintenance, fuel, and driver management.",
    url: "/demo/fleet",
    icon: Truck,
    status: "ACTIVE",
    features: ["Vehicle Track", "Maintenance", "Fuel Mgmt", "Drivers"],
    frontend: ["React", "TypeScript", "Maps UI"],
    backend: ["Node.js", "PostgreSQL", "GPS API"],
    color: "from-blue-600 to-indigo-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "courier-management",
    name: "Courier Management Software",
    category: "Courier",
    masterCategory: "Logistics & Transportation",
    description: "Courier software with AWB, tracking, hub management, and delivery proof.",
    url: "#",
    icon: Package,
    status: "COMING_SOON",
    features: ["AWB System", "Tracking", "Hub Mgmt", "POD"],
    frontend: ["React", "TypeScript", "Logistics UI"],
    backend: ["Node.js", "PostgreSQL", "Track API"],
    color: "from-orange-600 to-red-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },
  {
    id: "delivery-management",
    name: "Delivery Management System",
    category: "Delivery",
    masterCategory: "Logistics & Transportation",
    description: "Last-mile delivery with route optimization, rider app, and real-time tracking.",
    url: "#",
    icon: MapPin,
    status: "COMING_SOON",
    features: ["Route Optimize", "Rider App", "Real-time", "Proof"],
    frontend: ["React", "TypeScript", "Delivery UI"],
    backend: ["Node.js", "PostgreSQL", "Maps API"],
    color: "from-green-600 to-teal-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "transport-erp",
    name: "Transport ERP",
    category: "Transport ERP",
    masterCategory: "Logistics & Transportation",
    description: "Complete transport ERP with booking, billing, LR, and accounts integration.",
    url: "#",
    icon: Truck,
    status: "COMING_SOON",
    features: ["Booking", "LR/GR", "Billing", "Accounts"],
    frontend: ["React", "TypeScript", "ERP UI"],
    backend: ["Node.js", "PostgreSQL", "GST API"],
    color: "from-purple-600 to-indigo-600",
    price: "₹79,999",
    discountPrice: "₹47,999"
  },
  {
    id: "route-trip",
    name: "Route & Trip Management",
    category: "Route Planning",
    masterCategory: "Logistics & Transportation",
    description: "Route planning with trip scheduling, waypoints, ETAs, and cost optimization.",
    url: "#",
    icon: MapPin,
    status: "COMING_SOON",
    features: ["Route Plan", "Trip Schedule", "ETA", "Cost Optimize"],
    frontend: ["React", "TypeScript", "Maps UI"],
    backend: ["Node.js", "PostgreSQL", "Routing API"],
    color: "from-cyan-600 to-blue-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "driver-management",
    name: "Driver Management",
    category: "Driver Mgmt",
    masterCategory: "Logistics & Transportation",
    description: "Driver management with documents, performance, payroll, and compliance tracking.",
    url: "#",
    icon: UserCheck,
    status: "COMING_SOON",
    features: ["Documents", "Performance", "Payroll", "Compliance"],
    frontend: ["React", "TypeScript", "HR UI"],
    backend: ["Node.js", "PostgreSQL", "Document API"],
    color: "from-amber-600 to-orange-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "gps-tracking",
    name: "GPS Tracking System",
    category: "GPS Tracking",
    masterCategory: "Logistics & Transportation",
    description: "Real-time GPS tracking with geofencing, alerts, history, and reports.",
    url: "#",
    icon: MapPin,
    status: "COMING_SOON",
    features: ["Live Track", "Geofencing", "Alerts", "History"],
    frontend: ["React", "TypeScript", "Map UI"],
    backend: ["Node.js", "PostgreSQL", "GPS API"],
    color: "from-red-600 to-rose-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },

  // ============= 5. REAL ESTATE & PROPERTY MANAGEMENT (7 Sub-categories) =============
  {
    id: "property-management",
    name: "Property Management System",
    category: "Property Mgmt",
    masterCategory: "Real Estate & Property Management",
    description: "Property management with listings, tenants, leases, and maintenance tracking.",
    url: "/demo/property",
    icon: Home,
    status: "ACTIVE",
    features: ["Listings", "Tenants", "Leases", "Maintenance"],
    frontend: ["React", "TypeScript", "Real Estate UI"],
    backend: ["Node.js", "PostgreSQL", "Document API"],
    color: "from-emerald-600 to-green-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },
  {
    id: "realestate-crm",
    name: "Real Estate CRM",
    category: "Real Estate CRM",
    masterCategory: "Real Estate & Property Management",
    description: "Real estate CRM with leads, site visits, follow-ups, and deal tracking.",
    url: "#",
    icon: Target,
    status: "COMING_SOON",
    features: ["Leads", "Site Visits", "Follow-ups", "Deals"],
    frontend: ["React", "TypeScript", "CRM UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-blue-600 to-indigo-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "society-management",
    name: "Society / Apartment Management",
    category: "Society Mgmt",
    masterCategory: "Real Estate & Property Management",
    description: "Society management with maintenance, complaints, amenities, and visitor tracking.",
    url: "#",
    icon: Building,
    status: "COMING_SOON",
    features: ["Maintenance", "Complaints", "Amenities", "Visitors"],
    frontend: ["React", "TypeScript", "Society UI"],
    backend: ["Node.js", "PostgreSQL", "Payment API"],
    color: "from-purple-600 to-pink-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "rental-management",
    name: "Rental Management Software",
    category: "Rental Mgmt",
    masterCategory: "Real Estate & Property Management",
    description: "Rental management with agreements, rent collection, and tenant communication.",
    url: "#",
    icon: Home,
    status: "COMING_SOON",
    features: ["Agreements", "Rent Collect", "Tenant Comm", "Reports"],
    frontend: ["React", "TypeScript", "Rental UI"],
    backend: ["Node.js", "PostgreSQL", "E-Sign API"],
    color: "from-teal-600 to-cyan-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "broker-agency",
    name: "Broker / Agency Management",
    category: "Broker Agency",
    masterCategory: "Real Estate & Property Management",
    description: "Broker management with agent performance, commissions, and deal tracking.",
    url: "#",
    icon: Briefcase,
    status: "COMING_SOON",
    features: ["Agent Mgmt", "Commissions", "Deals", "Reports"],
    frontend: ["React", "TypeScript", "Agency UI"],
    backend: ["Node.js", "PostgreSQL", "Payout API"],
    color: "from-orange-600 to-amber-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "maintenance-mgmt",
    name: "Maintenance Management",
    category: "Maintenance",
    masterCategory: "Real Estate & Property Management",
    description: "Property maintenance with work orders, vendors, scheduling, and cost tracking.",
    url: "#",
    icon: ClipboardCheck,
    status: "COMING_SOON",
    features: ["Work Orders", "Vendors", "Scheduling", "Costs"],
    frontend: ["React", "TypeScript", "Maintenance UI"],
    backend: ["Node.js", "PostgreSQL", "Notification API"],
    color: "from-gray-600 to-slate-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },
  {
    id: "visitor-parking",
    name: "Visitor & Parking Management",
    category: "Visitor Parking",
    masterCategory: "Real Estate & Property Management",
    description: "Visitor management with pre-registration, parking allocation, and access control.",
    url: "#",
    icon: Car,
    status: "COMING_SOON",
    features: ["Pre-Register", "Parking", "Access", "Logs"],
    frontend: ["React", "TypeScript", "Security UI"],
    backend: ["Node.js", "PostgreSQL", "Gate API"],
    color: "from-indigo-600 to-purple-600",
    price: "₹29,999",
    discountPrice: "₹17,999"
  },

  // ============= 6. FINANCE, BANKING & FINTECH (7 Sub-categories) =============
  {
    id: "digital-wallet",
    name: "Digital Wallet System",
    category: "Digital Wallet",
    masterCategory: "Finance, Banking & FinTech",
    description: "Digital wallet with P2P transfers, bill payments, QR pay, and transaction history.",
    url: "/demo/wallet",
    icon: Wallet,
    status: "ACTIVE",
    features: ["P2P Transfer", "Bill Pay", "QR Pay", "History"],
    frontend: ["React", "TypeScript", "FinTech UI"],
    backend: ["Node.js", "PostgreSQL", "Payment API"],
    color: "from-green-600 to-emerald-600",
    price: "₹89,999",
    discountPrice: "₹53,999"
  },
  {
    id: "banking-core",
    name: "Banking Core Software",
    category: "Core Banking",
    masterCategory: "Finance, Banking & FinTech",
    description: "Core banking with accounts, transactions, interest calculation, and compliance.",
    url: "#",
    icon: Landmark,
    status: "COMING_SOON",
    features: ["Accounts", "Transactions", "Interest", "Compliance"],
    frontend: ["React", "TypeScript", "Banking UI"],
    backend: ["Node.js", "PostgreSQL", "Secure API"],
    color: "from-blue-600 to-indigo-600",
    price: "₹1,49,999",
    discountPrice: "₹89,999"
  },
  {
    id: "loan-management",
    name: "Loan Management System",
    category: "Loan Mgmt",
    masterCategory: "Finance, Banking & FinTech",
    description: "Loan management with applications, disbursement, EMI, and collection tracking.",
    url: "#",
    icon: CreditCard,
    status: "COMING_SOON",
    features: ["Applications", "Disbursement", "EMI", "Collection"],
    frontend: ["React", "TypeScript", "Loan UI"],
    backend: ["Node.js", "PostgreSQL", "Credit API"],
    color: "from-purple-600 to-pink-600",
    price: "₹79,999",
    discountPrice: "₹47,999"
  },
  {
    id: "payment-gateway",
    name: "Payment Gateway Software",
    category: "Payment Gateway",
    masterCategory: "Finance, Banking & FinTech",
    description: "Payment gateway with multi-currency, fraud detection, and merchant dashboard.",
    url: "#",
    icon: CreditCard,
    status: "COMING_SOON",
    features: ["Multi-Currency", "Fraud Detect", "Merchant", "Reports"],
    frontend: ["React", "TypeScript", "Payment UI"],
    backend: ["Node.js", "PostgreSQL", "PCI DSS"],
    color: "from-orange-600 to-red-600",
    price: "₹1,29,999",
    discountPrice: "₹77,999"
  },
  {
    id: "investment-mgmt",
    name: "Investment Management System",
    category: "Investment",
    masterCategory: "Finance, Banking & FinTech",
    description: "Investment platform with portfolio, SIP, mutual funds, and performance tracking.",
    url: "#",
    icon: TrendingUp,
    status: "COMING_SOON",
    features: ["Portfolio", "SIP", "Mutual Funds", "Performance"],
    frontend: ["React", "TypeScript", "Investment UI"],
    backend: ["Node.js", "PostgreSQL", "Market API"],
    color: "from-teal-600 to-cyan-600",
    price: "₹99,999",
    discountPrice: "₹59,999"
  },
  {
    id: "emi-credit",
    name: "EMI & Credit Management",
    category: "EMI Credit",
    masterCategory: "Finance, Banking & FinTech",
    description: "EMI management with credit scoring, payment scheduling, and overdue tracking.",
    url: "#",
    icon: Coins,
    status: "COMING_SOON",
    features: ["Credit Score", "EMI Schedule", "Overdue", "Recovery"],
    frontend: ["React", "TypeScript", "Credit UI"],
    backend: ["Node.js", "PostgreSQL", "Bureau API"],
    color: "from-amber-600 to-yellow-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "kyc-verification",
    name: "KYC & Verification System",
    category: "KYC",
    masterCategory: "Finance, Banking & FinTech",
    description: "KYC platform with document verification, face match, and compliance reporting.",
    url: "#",
    icon: UserCheck,
    status: "COMING_SOON",
    features: ["Document Verify", "Face Match", "Compliance", "Reports"],
    frontend: ["React", "TypeScript", "KYC UI"],
    backend: ["Node.js", "PostgreSQL", "AI Verify"],
    color: "from-rose-600 to-pink-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },

  // ============= 7. ACCOUNTING, BILLING & TAXATION (7 Sub-categories) =============
  {
    id: "accounting-software",
    name: "Accounting Software",
    category: "Accounting",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Complete accounting with ledgers, journals, trial balance, and financial statements.",
    url: "/demo/accounting",
    icon: Calculator,
    status: "ACTIVE",
    features: ["Ledgers", "Journals", "Trial Balance", "Statements"],
    frontend: ["React", "TypeScript", "Accounting UI"],
    backend: ["Node.js", "PostgreSQL", "Reports"],
    color: "from-blue-600 to-indigo-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "billing-software",
    name: "Billing & Invoicing Software",
    category: "Billing Invoice",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Professional invoicing with estimates, recurring bills, and payment reminders.",
    url: "#",
    icon: Receipt,
    status: "COMING_SOON",
    features: ["Invoices", "Estimates", "Recurring", "Reminders"],
    frontend: ["React", "TypeScript", "Invoice UI"],
    backend: ["Node.js", "PostgreSQL", "PDF API"],
    color: "from-green-600 to-teal-600",
    price: "₹29,999",
    discountPrice: "₹17,999"
  },
  {
    id: "gst-tax-software",
    name: "GST / VAT / Tax Software",
    category: "GST Tax",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Tax compliance with GST filing, returns, reconciliation, and e-invoicing.",
    url: "#",
    icon: FileText,
    status: "COMING_SOON",
    features: ["GST Filing", "Returns", "Reconciliation", "E-Invoice"],
    frontend: ["React", "TypeScript", "Tax UI"],
    backend: ["Node.js", "PostgreSQL", "GST API"],
    color: "from-purple-600 to-indigo-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "expense-management",
    name: "Expense Management System",
    category: "Expense Mgmt",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Expense tracking with receipt scanning, approvals, reimbursements, and reports.",
    url: "#",
    icon: DollarSign,
    status: "COMING_SOON",
    features: ["Receipt Scan", "Approvals", "Reimburse", "Reports"],
    frontend: ["React", "TypeScript", "Expense UI"],
    backend: ["Node.js", "PostgreSQL", "OCR API"],
    color: "from-orange-600 to-amber-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },
  {
    id: "financial-reporting",
    name: "Financial Reporting Software",
    category: "Financial Reports",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Financial reporting with P&L, balance sheet, cash flow, and custom reports.",
    url: "#",
    icon: PieChart,
    status: "COMING_SOON",
    features: ["P&L", "Balance Sheet", "Cash Flow", "Custom"],
    frontend: ["React", "TypeScript", "Report UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-cyan-600 to-blue-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "audit-compliance",
    name: "Audit & Compliance Software",
    category: "Audit",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Audit management with checklists, findings, compliance tracking, and reports.",
    url: "#",
    icon: ClipboardCheck,
    status: "COMING_SOON",
    features: ["Checklists", "Findings", "Compliance", "Reports"],
    frontend: ["React", "TypeScript", "Audit UI"],
    backend: ["Node.js", "PostgreSQL", "Workflow"],
    color: "from-red-600 to-rose-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "multicurrency-accounting",
    name: "Multi-Currency Accounting",
    category: "Multi-Currency",
    masterCategory: "Accounting, Billing & Taxation",
    description: "Multi-currency accounting with exchange rates, conversions, and consolidated reports.",
    url: "#",
    icon: Coins,
    status: "COMING_SOON",
    features: ["Exchange Rates", "Conversions", "Consolidated", "Reports"],
    frontend: ["React", "TypeScript", "Global UI"],
    backend: ["Node.js", "PostgreSQL", "Forex API"],
    color: "from-emerald-600 to-green-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },

  // ============= 8. SALES, CRM & LEAD MANAGEMENT (7 Sub-categories) =============
  {
    id: "crm-software",
    name: "CRM Software",
    category: "CRM",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Complete CRM with contacts, deals, activities, and customer 360° view.",
    url: "/demo/crm",
    icon: Users,
    status: "ACTIVE",
    features: ["Contacts", "Deals", "Activities", "360° View"],
    frontend: ["React", "TypeScript", "CRM UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-blue-600 to-purple-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },
  {
    id: "lead-management",
    name: "Lead Management System",
    category: "Lead Mgmt",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Lead management with capture, scoring, assignment, and conversion tracking.",
    url: "#",
    icon: Target,
    status: "COMING_SOON",
    features: ["Lead Capture", "Scoring", "Assignment", "Conversion"],
    frontend: ["React", "TypeScript", "Lead UI"],
    backend: ["Node.js", "PostgreSQL", "Integration"],
    color: "from-green-600 to-teal-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "sales-automation",
    name: "Sales Automation Software",
    category: "Sales Auto",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Sales automation with workflows, sequences, templates, and task automation.",
    url: "#",
    icon: Zap,
    status: "COMING_SOON",
    features: ["Workflows", "Sequences", "Templates", "Tasks"],
    frontend: ["React", "TypeScript", "Auto UI"],
    backend: ["Node.js", "PostgreSQL", "Workflow Engine"],
    color: "from-orange-600 to-red-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "pipeline-deal",
    name: "Pipeline & Deal Management",
    category: "Pipeline",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Sales pipeline with stages, deal tracking, forecasting, and win/loss analysis.",
    url: "#",
    icon: TrendingUp,
    status: "COMING_SOON",
    features: ["Pipeline", "Deal Track", "Forecast", "Analysis"],
    frontend: ["React", "TypeScript", "Pipeline UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-purple-600 to-pink-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "customer-database",
    name: "Customer Database Management",
    category: "Customer DB",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Customer database with segmentation, tags, custom fields, and import/export.",
    url: "#",
    icon: Users,
    status: "COMING_SOON",
    features: ["Segments", "Tags", "Custom Fields", "Import/Export"],
    frontend: ["React", "TypeScript", "Data UI"],
    backend: ["Node.js", "PostgreSQL", "Bulk API"],
    color: "from-cyan-600 to-blue-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },
  {
    id: "followup-reminder",
    name: "Follow-Up & Reminder System",
    category: "Follow-Up",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Follow-up system with reminders, notifications, escalations, and activity logs.",
    url: "#",
    icon: Clock,
    status: "COMING_SOON",
    features: ["Reminders", "Notifications", "Escalations", "Logs"],
    frontend: ["React", "TypeScript", "Task UI"],
    backend: ["Node.js", "PostgreSQL", "Push API"],
    color: "from-amber-600 to-orange-600",
    price: "₹29,999",
    discountPrice: "₹17,999"
  },
  {
    id: "sales-reporting",
    name: "Sales Reporting & Analytics",
    category: "Sales Reports",
    masterCategory: "Sales, CRM & Lead Management",
    description: "Sales analytics with dashboards, KPIs, team performance, and custom reports.",
    url: "#",
    icon: BarChart3,
    status: "COMING_SOON",
    features: ["Dashboards", "KPIs", "Team Stats", "Reports"],
    frontend: ["React", "TypeScript", "Analytics UI"],
    backend: ["Node.js", "PostgreSQL", "BI Engine"],
    color: "from-indigo-600 to-purple-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },

  // ============= 9. MARKETING & ADVERTISING TECHNOLOGY (7 Sub-categories) =============
  {
    id: "digital-marketing",
    name: "Digital Marketing Platform",
    category: "Digital Marketing",
    masterCategory: "Marketing & Advertising Technology",
    description: "Digital marketing hub with SEO, SEM, content, and performance tracking.",
    url: "/demo/marketing",
    icon: Megaphone,
    status: "ACTIVE",
    features: ["SEO Tools", "SEM", "Content", "Performance"],
    frontend: ["React", "TypeScript", "Marketing UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-pink-600 to-rose-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "campaign-management",
    name: "Campaign Management Software",
    category: "Campaigns",
    masterCategory: "Marketing & Advertising Technology",
    description: "Campaign management with planning, execution, budget, and ROI tracking.",
    url: "#",
    icon: Target,
    status: "COMING_SOON",
    features: ["Planning", "Execution", "Budget", "ROI"],
    frontend: ["React", "TypeScript", "Campaign UI"],
    backend: ["Node.js", "PostgreSQL", "Ad API"],
    color: "from-purple-600 to-indigo-600",
    price: "₹54,999",
    discountPrice: "₹32,999"
  },
  {
    id: "social-media-mgmt",
    name: "Social Media Management Tool",
    category: "Social Media",
    masterCategory: "Marketing & Advertising Technology",
    description: "Social media management with scheduling, publishing, engagement, and analytics.",
    url: "#",
    icon: Share2,
    status: "COMING_SOON",
    features: ["Scheduling", "Publishing", "Engagement", "Analytics"],
    frontend: ["React", "TypeScript", "Social UI"],
    backend: ["Node.js", "PostgreSQL", "Social API"],
    color: "from-blue-600 to-cyan-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "email-marketing",
    name: "Email Marketing Software",
    category: "Email Marketing",
    masterCategory: "Marketing & Advertising Technology",
    description: "Email marketing with templates, automation, A/B testing, and deliverability.",
    url: "#",
    icon: Mail,
    status: "COMING_SOON",
    features: ["Templates", "Automation", "A/B Test", "Deliverability"],
    frontend: ["React", "TypeScript", "Email UI"],
    backend: ["Node.js", "PostgreSQL", "SMTP"],
    color: "from-green-600 to-teal-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation System",
    category: "Marketing Auto",
    masterCategory: "Marketing & Advertising Technology",
    description: "Marketing automation with workflows, triggers, nurturing, and lead scoring.",
    url: "#",
    icon: Zap,
    status: "COMING_SOON",
    features: ["Workflows", "Triggers", "Nurturing", "Scoring"],
    frontend: ["React", "TypeScript", "Auto UI"],
    backend: ["Node.js", "PostgreSQL", "Workflow"],
    color: "from-orange-600 to-amber-600",
    price: "₹59,999",
    discountPrice: "₹35,999"
  },
  {
    id: "lead-attribution",
    name: "Lead Attribution Software",
    category: "Attribution",
    masterCategory: "Marketing & Advertising Technology",
    description: "Lead attribution with multi-touch, channel tracking, and conversion paths.",
    url: "#",
    icon: TrendingUp,
    status: "COMING_SOON",
    features: ["Multi-Touch", "Channels", "Conversion", "Reports"],
    frontend: ["React", "TypeScript", "Attribution UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-red-600 to-rose-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "marketing-analytics",
    name: "Marketing Analytics Platform",
    category: "Marketing Analytics",
    masterCategory: "Marketing & Advertising Technology",
    description: "Marketing analytics with dashboards, ROI, funnel analysis, and custom reports.",
    url: "#",
    icon: BarChart3,
    status: "COMING_SOON",
    features: ["Dashboards", "ROI", "Funnel", "Reports"],
    frontend: ["React", "TypeScript", "Analytics UI"],
    backend: ["Node.js", "PostgreSQL", "BI"],
    color: "from-indigo-600 to-blue-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },

  // ============= 10. HUMAN RESOURCE & PAYROLL SYSTEMS (7 Sub-categories) =============
  {
    id: "hrms-software",
    name: "HRMS Software",
    category: "HRMS",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Complete HRMS with employee database, org chart, policies, and self-service.",
    url: "/demo/hrms",
    icon: Users,
    status: "ACTIVE",
    features: ["Employee DB", "Org Chart", "Policies", "Self-Service"],
    frontend: ["React", "TypeScript", "HR UI"],
    backend: ["Node.js", "PostgreSQL", "Auth"],
    color: "from-violet-600 to-purple-600",
    price: "₹69,999",
    discountPrice: "₹41,999"
  },
  {
    id: "payroll-management",
    name: "Payroll Management System",
    category: "Payroll",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Payroll processing with salary calculation, deductions, payslips, and compliance.",
    url: "#",
    icon: DollarSign,
    status: "COMING_SOON",
    features: ["Salary Calc", "Deductions", "Payslips", "Compliance"],
    frontend: ["React", "TypeScript", "Payroll UI"],
    backend: ["Node.js", "PostgreSQL", "Tax API"],
    color: "from-green-600 to-emerald-600",
    price: "₹49,999",
    discountPrice: "₹29,999"
  },
  {
    id: "attendance-biometric",
    name: "Attendance & Biometric System",
    category: "Attendance",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Attendance tracking with biometric, geo-fencing, shift management, and reports.",
    url: "#",
    icon: Fingerprint,
    status: "COMING_SOON",
    features: ["Biometric", "Geo-Fence", "Shifts", "Reports"],
    frontend: ["React", "TypeScript", "Attendance UI"],
    backend: ["Node.js", "PostgreSQL", "Device API"],
    color: "from-blue-600 to-indigo-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "leave-management",
    name: "Leave Management System",
    category: "Leave Mgmt",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Leave management with policies, approvals, balance tracking, and holiday calendar.",
    url: "#",
    icon: Calendar,
    status: "COMING_SOON",
    features: ["Policies", "Approvals", "Balance", "Holidays"],
    frontend: ["React", "TypeScript", "Leave UI"],
    backend: ["Node.js", "PostgreSQL", "Workflow"],
    color: "from-teal-600 to-cyan-600",
    price: "₹29,999",
    discountPrice: "₹17,999"
  },
  {
    id: "recruitment-hiring",
    name: "Recruitment & Hiring Software",
    category: "Recruitment",
    masterCategory: "Human Resource & Payroll Systems",
    description: "ATS with job postings, applications, interviews, and offer management.",
    url: "#",
    icon: Briefcase,
    status: "COMING_SOON",
    features: ["Job Posts", "Applications", "Interviews", "Offers"],
    frontend: ["React", "TypeScript", "ATS UI"],
    backend: ["Node.js", "PostgreSQL", "Email API"],
    color: "from-orange-600 to-red-600",
    price: "₹44,999",
    discountPrice: "₹26,999"
  },
  {
    id: "performance-management",
    name: "Performance Management System",
    category: "Performance",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Performance management with goals, reviews, 360° feedback, and appraisals.",
    url: "#",
    icon: Award,
    status: "COMING_SOON",
    features: ["Goals", "Reviews", "360° Feedback", "Appraisals"],
    frontend: ["React", "TypeScript", "Performance UI"],
    backend: ["Node.js", "PostgreSQL", "Analytics"],
    color: "from-purple-600 to-pink-600",
    price: "₹39,999",
    discountPrice: "₹23,999"
  },
  {
    id: "employee-selfservice",
    name: "Employee Self-Service Portal",
    category: "ESS Portal",
    masterCategory: "Human Resource & Payroll Systems",
    description: "Employee portal with profile, documents, requests, and communication.",
    url: "#",
    icon: UserCog,
    status: "COMING_SOON",
    features: ["Profile", "Documents", "Requests", "Communication"],
    frontend: ["React", "TypeScript", "Portal UI"],
    backend: ["Node.js", "PostgreSQL", "Auth"],
    color: "from-amber-600 to-yellow-600",
    price: "₹34,999",
    discountPrice: "₹20,999"
  }
];

// Master Categories for filtering
const masterCategories = [
  "All",
  "Education & eLearning",
  "Retail & POS Systems",
  "Healthcare & Medical Systems",
  "Logistics & Transportation",
  "Real Estate & Property Management",
  "Finance, Banking & FinTech",
  "Accounting, Billing & Taxation",
  "Sales, CRM & Lead Management",
  "Marketing & Advertising Technology",
  "Human Resource & Payroll Systems"
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredDemos = allDemos.filter(demo => {
    const matchesCategory = activeCategory === "All" || demo.masterCategory === activeCategory;
    const matchesSearch = demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.masterCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Count demos per master category
  const getCategoryCount = (category: string) => {
    if (category === "All") return allDemos.length;
    return allDemos.filter(d => d.masterCategory === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1e36] to-[#0a1628]">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 py-4 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={softwareValaLogo} alt="Software Vala" className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-lg" />
              <div>
                <h1 className="text-white font-bold text-2xl">Software Vala</h1>
                <p className="text-white/90 text-sm">- The Name of Trust</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Badge className="bg-white/20 text-white border-0 animate-pulse text-sm px-4 py-2">
                🎉 New Year Sale - 40% OFF! 🎉
              </Badge>
              <Badge className="bg-white text-orange-600 font-bold text-lg px-4 py-2">40% OFF</Badge>
              <Link to="/admin">
                <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#0d1e36] to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
              <Star className="h-3 w-3 mr-1" /> 10 Master Categories • 70 Software Solutions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Business Software</span> Marketplace
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              Premium enterprise solutions across Education, Healthcare, Finance, Retail, Logistics & more.
              Start your business today with our ready-to-deploy software!
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" /> Full Source Code
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="h-5 w-5" /> 1 Year Free Support
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <CheckCircle className="h-5 w-5" /> Free Installation
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle className="h-5 w-5" /> Lifetime Updates
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter - Master Categories */}
      <div className="bg-[#0d1e36]/80 backdrop-blur-sm border-b border-cyan-500/20 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search software..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a2d4a] border-cyan-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {filteredDemos.length} Products
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {masterCategories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat 
                  ? "bg-cyan-500 text-white hover:bg-cyan-600" 
                  : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                }
              >
                {cat === "All" ? `All (${getCategoryCount(cat)})` : cat}
                {cat !== "All" && (
                  <span className="ml-1 text-xs opacity-70">({getCategoryCount(cat)})</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Cards Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Group by Master Category when "All" is selected */}
          {activeCategory === "All" ? (
            masterCategories.slice(1).map(masterCat => {
              const categoryDemos = filteredDemos.filter(d => d.masterCategory === masterCat);
              if (categoryDemos.length === 0) return null;
              
              return (
                <div key={masterCat} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold text-white">{masterCat}</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {categoryDemos.length} Products
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryDemos.map((demo, index) => (
                      <DemoCard 
                        key={demo.id} 
                        demo={demo} 
                        index={index}
                        isFavorite={favorites.includes(demo.id)}
                        onToggleFavorite={() => toggleFavorite(demo.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDemos.map((demo, index) => (
                <DemoCard 
                  key={demo.id} 
                  demo={demo} 
                  index={index}
                  isFavorite={favorites.includes(demo.id)}
                  onToggleFavorite={() => toggleFavorite(demo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1628] border-t border-cyan-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Software Vala - The Name of Trust. All rights reserved.</p>
          <p className="text-cyan-400 mt-2">10 Master Categories • 70 Software Solutions • Unlimited Possibilities</p>
        </div>
      </footer>
    </div>
  );
};

// Demo Card Component
const DemoCard = ({ demo, index, isFavorite, onToggleFavorite }: { 
  demo: Demo; 
  index: number; 
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const Icon = demo.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-[#1a2d4a] to-[#0d1e36] border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden group h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${demo.color} p-4 relative`}>
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex gap-2">
                {demo.status === "COMING_SOON" && (
                  <Badge className="bg-yellow-500/90 text-black font-bold text-xs">
                    COMING SOON
                  </Badge>
                )}
                {demo.status === "ACTIVE" && (
                  <Badge className="bg-emerald-500/90 text-white font-bold text-xs">
                    LIVE DEMO
                  </Badge>
                )}
              </div>
            </div>
            <button 
              onClick={onToggleFavorite}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1">{demo.name}</h3>
            <p className="text-cyan-400 text-xs mb-2">{demo.category}</p>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{demo.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {demo.features.slice(0, 3).map(feature => (
                <Badge key={feature} variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
                  {feature}
                </Badge>
              ))}
              {demo.features.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                  +{demo.features.length - 3}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 line-through text-sm">{demo.price}</span>
              <span className="text-emerald-400 font-bold text-xl">{demo.discountPrice}</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">40% OFF</Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              {demo.status === "ACTIVE" ? (
                <>
                  <Link to={demo.url} className="flex-1">
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                      <Play className="h-4 w-4 mr-2" /> Demo
                    </Button>
                  </Link>
                  <Button 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => toast.success("Redirecting to purchase...")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Buy
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-1 bg-gray-600 cursor-not-allowed text-white"
                    disabled
                    onClick={() => toast.info("Demo coming soon!")}
                  >
                    <Play className="h-4 w-4 mr-2" /> Demo
                  </Button>
                  <Button 
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => toast.info("Pre-order coming soon!")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Pre-Order
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Index;
