# QR Code Generator

<p align="center">
  <a href="http://nipoanz.com/" target="blank"><img src="https://github.com/potier97/rfid-access-iot/raw/main/assets/image-6.png" width="300" alt="NPA Logo" /></a>
</p>

A modern web application for generating custom QR codes with multiple customization options. Built with React and TypeScript.

![QR Code Example](./public/qr.png)

## Features

- 🎨 Complete Design Customization:
  - QR Code Color
  - Background Color
  - Adjustable Size
  - Rounded Borders
  - Customizable Margins
  - Logo Support

- 📱 Multiple QR Types:
  - URLs
  - Email Addresses
  - Phone Numbers
  - Locations
  - WiFi Networks
  - Plain Text

- ✨ Additional Features:
  - Real-time Validation
  - Instant Preview
  - Intuitive Interface
  - Responsive Design
  - High-quality Export

## Technologies Used

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Components**:
  - `qrcode.react` for QR generation
  - `react-colorful` for color pickers
  - `@heroicons/react` for iconography
  - `next.js` as main framework

## Main Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "next": "^13.x",
    "qrcode.react": "^3.x",
    "react-colorful": "^5.x",
    "@heroicons/react": "^2.x",
    "tailwindcss": "^3.x"
  }
}
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select QR Type**:
   - Choose between URL, Email, Phone, Location, WiFi, or Text
   - Each type has its own validation and format

2. **Customize Content**:
   - Enter information according to selected type
   - Real-time validation will guide you

3. **Adjust Design**:
   - Modify colors using picker or hexadecimal codes
   - Adjust size with slider
   - Customize rounded borders
   - Adjust QR margins
   - Optionally add a logo (PNG format)

4. **Download**:
   - Download button will be enabled when content is valid
   - Image will be downloaded in high-quality PNG format

## Contributions

1. Fork the repository
2. Create a new branch (`git checkout -b feature-new-functionality`)
3. Commit your changes (`git commit -am 'Add new functionality'`)
4. Push to the branch (`git push origin feature-new-functionality`)
5. Create a Pull Request

## Author

- [Nicolas Potier](https://github.com/potier97/)

## License

This project is under the MIT License.
