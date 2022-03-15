# Dear Reader

Dear Reader sends your favorite newsletters from Feedbin directly to your Kindle.

![image](https://user-images.githubusercontent.com/4933/158419840-9f73e817-6c19-434c-8cf1-b40ef783697e.png)

### How does it work?

Dear Reader uses the Feedbin API to get the newsletters from the tag you select, creates an ebook, and delivers it to your Kindle.

### How to install it

1. Clone the project
2. Install the dependencies
3. Run `yarn start`
4. Open `https://localhost:3000` and use the installation wizard.


### What info will you need?

1. Your Feedbin username and password.
2. Your Send-to-Kindle e-mail address.
3. Your email SMTP information.
4. An OpenWeather API (optional)

### How do I send the ebook with the newsletters?

Just send a `GET` request to the endpoint `/api/deliver` of the server where Dear Reader is installed.
