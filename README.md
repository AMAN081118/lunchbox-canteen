# College Canteen Ordering Automation WebApp

A modern, open source web application designed to automate college canteen ordering. The system streamlines food ordering, payments, menu viewing, and order tracking for both students and canteen owners.

## Project Overview

This application transforms traditional college canteen ordering, which is typically handled in person or over the phone and tracked manually in notebooks. It provides a digital platform through which students can:

- Browse live menus for multiple canteens.
- Place orders online and make digital payments (e.g. UPI). - (To be implemented)
- Receive real-time updates about their order status.
- Track order history and view digital bills.

Canteen staff and owners can efficiently manage incoming orders, update menu items, send notifications, perform revenue analytics, and gather feedback.

The system is designed to tackle issues such as rush at counters, difficulty tracking dish availability, and inability to gather meaningful business metrics.

## Key Features

- **Student Interface:** Order food, see real-time menu availability, rate and review dishes, track expenses, and get intelligent suggestions based on order history.
- **Owner/Admin Interface:** Manage menu, view and act on live orders, send notifications, analyze sales data, collect feedback, and automate billing.
- **Recommendation System:** Built-in machine learning adapts to customer preferences and can predict optimal order timing.
- **Authentication:** Users register with a college ID or request verification for access.
- **Scalability:** Any verified user can list a new canteen or venture and manage its menu and orders.
- **Technology Stack:** Next.js for frontend UI/UX, Supabase PostgreSQL for backend, Redis and Upstash for caching and rate limiting, Python for machine learning.
- **Deployment:** Easy to use for live in-class demos, web-based access for students, faculty, and staff.


## Database Design

Entities modeled in PostgreSQL include:

- **Canteens** (with assigned hostels and owners)
- **Canteen Owners**
- **Hostels** (including access policies)
- **Menu Items** (with descriptions, pricing, nutrition info, prep times, categories)
- **Orders** and **Order Items** (tracking status, price, scheduling, payment)
- **User Profiles** (with role, contact info, hostel, preferences)
- **Feedback** (ratings and comments per dish/order)
- **Order Events** (for tracking processing stages)
- **User Carts**


## Getting Started

1. **Fork or Clone** this repository.
2. **Set up** the backend with Supabase and configure PostgreSQL according to the provided schema.
3. **Deploy** the frontend using Next.js and configure the backend endpoints.
4. **Customize/extend** the system for your campus or use-case.

## Open Source License

This project is open source: anyone is welcome to fork, modify, and use the code for educational or commercial purposes. Contributions are encouraged!

## Contributions

1. Fork the repository.
2. Make changes in your branch.
3. Create a pull request for review.

## Demo

The app is deployment so that anyone can interact with the system in a live classroom or presentation environment.
Deployed Link: https://lunchbox-canteen.vercel.app/

***




