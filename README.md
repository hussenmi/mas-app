# MAS Queens Connect (Web)

This is a web application for the MAS Queens community, providing prayer times, event RSVPs, and donation capabilities.

### Running the Development Server

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Configuration

Create a `.env.local` file in the root of the project to store your environment variables:

```
NEXT_PUBLIC_STRIPE_PAYMENT_LINK="https://buy.stripe.com/your_payment_link"
```

### Prayer Time Calculation

The prayer times are calculated using the **ISNA (Islamic Society of North America)** method by default. You can change this by modifying the `METHOD` constant in `src/app/api/prayers/route.ts`. A list of available methods can be found in the [Al-Adhan API documentation](https://aladhan.com/prayer-times-api#GetTimings).
