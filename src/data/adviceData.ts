interface IAdviceArray {
    [key: string]: {id: number, advice: string }[];
  }

export const adviceArray: IAdviceArray = {
    "Staying Safe": [
        {id: 1, advice: "Use complex passwords and update them regularly to protect your account."},
        {id: 2, advice: "Never share your account login details with anyone."},
        {id: 3, advice: "Enable two-factor authentication for an additional layer of security."},
        {id: 4, advice: "Be cautious about downloading files or clicking on links from unknown sources."},
        {id: 5, advice: "Use a secure network when shopping online, avoid public Wi-Fi for transactions."},
        {id: 6, advice: "Keep your device's operating system and applications up-to-date."}
    ],
    "Fraud Prevention": [
        {id: 1, advice: "Always complete transactions within the platform to ensure you're protected."},
        {id: 2, advice: "Avoid sellers or buyers who ask for off-platform communication or payment."},
        {id: 3, advice: "If a deal seems too good to be true, it probably is. Stay vigilant."},
        {id: 4, advice: "Check the user's ratings and reviews before conducting business with them."},
        {id: 5, advice: "Always use secure payment methods—never send cash, checks, or wire transfers."},
        {id: 6, advice: "In case of a dispute, reach out to our customer service team for assistance."}
    ],
    "Engagement": [
        {id: 1, advice: "Use a clear, friendly profile picture to make your account more personal."},
        {id: 2, advice: "Complete all sections of your profile—it helps others trust and understand you better."},
        {id: 3, advice: "Be responsive! Quick replies to queries can improve your ratings."},
        {id: 4, advice: "Ask for reviews politely. Positive reviews can boost your profile visibility."},
        {id: 5, advice: "Regularly update your listings and status to show that you're an active user."},
        {id: 6, advice: "Share a bit about yourself in your bio—users appreciate knowing who they're dealing with."},
        {id: 7, advice: "Be honest and transparent in your item descriptions and communications."}
    ],
    "General Knowledge": [
        {id: 1, advice: "Did you know? The most expensive item ever sold online was a luxury yacht for over $170 million!" },
        {id: 2, advice: "Fact: Cyber Monday is typically the biggest online shopping day of the year." },
        {id: 3, advice: "E-commerce tip: Keeping your software updated can help protect against cyber threats." },
        {id: 4, advice: "Sustainable Shopping: Buying second-hand items can significantly reduce your carbon footprint." },
        {id: 5, advice: "Did you know? Over 2 billion people bought goods or services online in 2021." },
        {id: 6, advice: "Tip: Regularly changing your passwords can keep your account secure." },
        {id: 7, advice: "Fact: The first item sold on eBay was a broken laser pointer." },
        {id: 8, advice: "Remember to review our community guidelines to ensure a safe and pleasant experience for all users." },
        {id: 9, advice: "Sustainable Shopping: Consider eco-friendly packaging to reduce environmental impact." },
        {id: 10, advice: "Did you know? Online shoppers typically spend more on weekdays than weekends." }
      ]
};