# Visitor Management System (Electron App with Microsoft SQL Express)

## Overview
The Visitor Management System is an Electron-based desktop application designed for managing visitor data in a PDPA-compliant manner for Singapore. It features an NRIC validator to ensure valid Singapore NRIC/FIN numbers, encrypts all sensitive data, and automatically deletes visitor records that have not been updated for 3 months from the last visit date. Additionally, the system logs visitor check-ins and check-outs and provides a dashboard with summary statistics and a time-based graph using Chart.js.

## Features
- **Visitor Registration**
  - NRIC validation using a standard checksum algorithm.
  - Encryption of sensitive data (NRIC, name, additional details) before storage.
- **Visitor Logs**
  - Records visitor "IN" and "OUT" events.
  - Searchable logs for tracking visitor activity.
- **Dashboard**
  - Summary statistics including total visitors, check-ins, and check-outs.
  - Time-based graph visualization using Chart.js.
- **PDPA Compliance**
  - Automatic deletion of visitor records older than 3 months from the last visit date.

## Technologies Used
- [Electron](https://www.electronjs.org/) – Desktop application framework.
- [Microsoft SQL Express](https://www.microsoft.com/en-us/sql-server/sql-server-editions-express) – Database backend.
- [mssql](https://www.npmjs.com/package/mssql) – Node.js package for SQL Server connectivity.
- [Chart.js](https://www.chartjs.org/) – Library for rendering charts.
- Node.js built-in modules for encryption and data handling.

## Requirements
- **Node.js:** v14 or higher recommended.
- **npm:** Comes with Node.js.
- **Microsoft SQL Server Express:** Ensure it is installed and running, and create a database (e.g., `visitorDB`).

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/visitor-management-system.git
cd visitor-management-system
