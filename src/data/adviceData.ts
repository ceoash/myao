interface IAdviceArray {
    [key: string]: { advice: string }[];
  }

export const adviceArray: IAdviceArray = {
    "Staying Safe": [
        {advice: "Use complex passwords and update them regularly to protect your account."},
        {advice: "Never share your account login details with anyone."},
        {advice: "Enable two-factor authentication for an additional layer of security."},
        {advice: "Be cautious about downloading files or clicking on links from unknown sources."},
        {advice: "Use a secure network when shopping online, avoid public Wi-Fi for transactions."},
        {advice: "Keep your device's operating system and applications up-to-date."}
    ],
    "Fraud Prevention": [
        {advice: "Always complete transactions within the platform to ensure you're protected."},
        {advice: "Avoid sellers or buyers who ask for off-platform communication or payment."},
        {advice: "If a deal seems too good to be true, it probably is. Stay vigilant."},
        {advice: "Check the user's ratings and reviews before conducting business with them."},
        {advice: "Always use secure payment methods—never send cash, checks, or wire transfers."},
        {advice: "In case of a dispute, reach out to our customer service team for assistance."}
    ],
    "Engagement": [
        {advice: "Use a clear, friendly profile picture to make your account more personal."},
        {advice: "Complete all sections of your profile—it helps others trust and understand you better."},
        {advice: "Be responsive! Quick replies to queries can improve your ratings."},
        {advice: "Ask for reviews politely. Positive reviews can boost your profile visibility."},
        {advice: "Regularly update your listings and status to show that you're an active user."},
        {advice: "Share a bit about yourself in your bio—users appreciate knowing who they're dealing with."},
        {advice: "Be honest and transparent in your item descriptions and communications."}
    ],
    "General Knowledge": [
        { advice: "Did you know? The most expensive item ever sold online was a luxury yacht for over $170 million!" },
        { advice: "Fact: Cyber Monday is typically the biggest online shopping day of the year." },
        { advice: "E-commerce tip: Keeping your software updated can help protect against cyber threats." },
        { advice: "Sustainable Shopping: Buying second-hand items can significantly reduce your carbon footprint." },
        { advice: "Did you know? Over 2 billion people bought goods or services online in 2021." },
        { advice: "Tip: Regularly changing your passwords can keep your account secure." },
        { advice: "Fact: The first item sold on eBay was a broken laser pointer." },
        { advice: "Remember to review our community guidelines to ensure a safe and pleasant experience for all users." },
        { advice: "Sustainable Shopping: Consider eco-friendly packaging to reduce environmental impact." },
        { advice: "Did you know? Online shoppers typically spend more on weekdays than weekends." }
      ]
};