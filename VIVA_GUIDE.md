# SeatSync — Viva & Presentation Defense Guide
## Advanced Web Technology (AWT) — Total Marks: 30

This document contains expected viva questions, technical justifications, and answers for all 4 team members.

---

### Quick Project Summary (30-Second Elevator Pitch)
> "SeatSync is a smart library seat availability and reservation web application designed for university students and administrators. Built strictly on the AWT stack (HTML5, plain CSS, AngularJS 1.x, Node.js, Express, Sessions, MongoDB, and D3.js), it solves library desk congestion by offering real-time seat status maps, 2-hour slot reservations protected by backend HTTP 409 conflict checks, an interactive RFID card-punch turnstile exit system, and D3.js SVG visual analytics for staff."

---

### Core Viva Questions & Model Answers

#### 1. Front-End: AngularJS 1.x (Unit II)
**Q: Why did you use AngularJS 1.x instead of modern Angular or React?**
*Answer:* The course curriculum specifically mandates AngularJS 1.x. AngularJS demonstrates two-way data binding (`ng-model`), scope inheritance, client-side filtering, and custom directives without the overhead of heavy build systems.

**Q: Where have you implemented a custom directive?**
*Answer:* In `frontend/js/directives/seat.directive.js`, we implemented `<seat-badge status="seat.status">`. It isolates the template and styles for rendering available, reserved, occupied, and maintenance badges across student and admin views.

**Q: What is the Scope Prototypal Inheritance issue with `ng-if`, and how did you handle it?**
*Answer:* Directives like `ng-if` and `ng-repeat` create child scopes. If you bind directly to a primitive variable (`activeTab = 'reserve'`), it writes to the child scope instead of the parent controller. We resolved this by implementing `$scope.switchTab(tabName)` on the parent controller so child elements trigger the parent scope method cleanly.

---

#### 2. Server-Side: Node.js & Express (Unit III)
**Q: How does the Node.js Event Loop handle concurrent seat booking requests?**
*Answer:* Node.js uses a single-threaded event-driven non-blocking I/O model. While request parsing and routing run on the main thread, database operations (`mongoose.connect`, `Booking.findOne`, `save`) are delegated to libuv worker threads. When MongoDB responds, the callback/promise returns to the event queue.

**Q: How do you prevent two students from booking the same seat at the exact same second?**
*Answer:* We do not rely on frontend checks. In `backend/controllers/booking.controller.js`, right before calling `booking.save()`, we execute an immediate database query for overlapping confirmed intervals:
`existing.startAt < requested.endAt AND existing.endAt > requested.startAt AND status === 'confirmed'`.
If any conflict exists, the transaction is rejected immediately with **HTTP 409 Conflict**. Furthermore, we have a composite index `{ seatId: 1, startAt: 1, endAt: 1, status: 1 }` for rapid indexed lookups.

---

#### 3. State Management: Sessions & Cookies (Unit IV)
**Q: Explain your session lifecycle. Where are sessions stored?**
*Answer:* We use `express-session` with `connect-mongo`. Sessions are stored in MongoDB in the `sessions` collection. 
- On login (`POST /api/auth/login`), the server verifies the bcrypt password hash, creates `req.session.user`, and sends back an HTTP-Only cookie `connect.sid`.
- Protected routes use `requireAuth` middleware to inspect `req.session.user`.
- On logout (`POST /api/auth/logout`), `req.session.destroy()` wipes the session from MongoDB and `res.clearCookie('connect.sid')` clears the browser cookie.

**Q: Why use `httpOnly: true` on cookies?**
*Answer:* `httpOnly: true` prevents client-side JavaScript (`document.cookie`) from accessing the session identifier, mitigating Cross-Site Scripting (XSS) session theft attacks.

---

#### 4. Database: MongoDB & Mongoose (Unit IV)
**Q: What collections do you have and what are their relationships?**
*Answer:* Four collections:
1. `users`: Stores students and admins.
2. `floors`: Stores library floors and reading zones.
3. `seats`: Stores physical desks with composite index on `{ floorId: 1, seatNumber: 1 }`.
4. `bookings`: References `userId`, `seatId`, and `floorId`.
A user has many bookings; a seat has many historical bookings. Dynamic seat availability is calculated by cross-referencing physical seat status with active bookings for the selected date and slot.

---

#### 5. Data Visualisation: D3.js + SVG (Unit V)
**Q: How does D3.js render the occupancy chart?**
*Answer:* In `frontend/js/charts.js`, D3 fetches live aggregation data from `/api/admin/analytics/occupancy`. It calculates `d3.scaleBand()` for floor codes and `d3.scaleLinear()` for seat counts, creating dynamic SVG `<rect>` elements with animated height transitions (`.transition().duration(600)`) and axes (`d3.axisBottom`, `d3.axisLeft`).

---

#### 6. Real-World Innovation: RFID Turnstile Exit
**Q: Explain how the exit feature works.**
*Answer:* In a real campus library, students punch their RFID smart card at exit turnstiles. We built `POST /api/bookings/punch-exit` which accepts a student's SAP ID (`590029022`), unlocks the turnstile gate, and automatically releases their seat in MongoDB so another student can immediately reserve it.
