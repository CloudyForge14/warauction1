// utils/emailTemplates.js
export const templates = {
  welcome: {
      subject: 'Welcome to CloudyForge!',
      text: (username) => `Hello, ${username}! Welcome to CloudyForge.`,
      html: (username) =>
        `<h1>Hello, ${username}!</h1><p>Welcome to CloudyForge.</p>`,
    },
  bidAccepted: {
        subject: 'Your Bid Has Been Successfully Placed!',
        text: (username, itemName, bidAmount) =>
          `Hi ${username},\n\nYour bid of $${bidAmount} on "${itemName}" has been successfully placed. You are currently the highest bidder!\n\nGood luck!\n\nBest regards,\nCloudyForge Team`,
        html: (username, itemName, bidAmount) =>
          `<h1>Hi ${username},</h1>
          <p>Your bid of <strong>$${bidAmount}</strong> on <em>${itemName}</em> has been successfully placed.</p>
          <p>You are currently the highest bidder! Good luck!</p>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      },
    
  newOptionsAvailable: {
        subject: 'New Artillery Options Available!',
        text: (username) => 
          `Hi ${username},\n\nNew BOMB options have been added to Project Revenge!\n\nCheck them out and send your message to Russian forces today.\n\nBest regards,\nCloudyForge Team`,
        html: (username) => 
          `<h1>Hi ${username},</h1>
          <p>New BOMB options have been added to <strong>Project Revenge</strong>!</p>
          <p>Check them out and send your message to Russian forces today.</p>
          <p><a href="https://cloudyforge.com/en/artillery" style="color: #2563eb; text-decoration: underline;">View New Options</a></p>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`
      },
    
      // Шаблон 2: Ваша ставка перебита
      bidOvertaken: {
        subject: 'Your Bid Has Been Outbid!',
        text: (username, itemName, currentBid) =>
          `Hi ${username},\n\nUnfortunately, your bid on "${itemName}" has been outbid. The current highest bid is now $${currentBid}.\n\nYou can place a new bid to stay in the game!\n\nBest regards,\nCloudyForge Team`,
        html: (username, itemName, currentBid) =>
          `<h1>Hi ${username},</h1>
          <p>Unfortunately, your bid on <em>${itemName}</em> has been outbid.</p>
          <p>The current highest bid is now <strong>$${currentBid}</strong>.</p>
          <p><a href="https://cloudyforge.com/en/auction" style="color: blue; text-decoration: underline;">Place a new bid</a> to stay in the game!</p>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      },
    
      // Шаблон 3: Сообщение по амуниции принято
      messageAccepted: {
        subject: 'Your Ammunition Request Has Been Approved!',
        textWithPayPal: (username, itemName, userMessage, paypalEmail) =>
          `Hi ${username},\n\nYour message regarding the item "${itemName}" has been approved.\n\nYour message: "${userMessage}"\n\nConfirm your order - send payment to PayPal: ${paypalEmail}\n\nBest regards,\nCloudyForge Team`,
        htmlWithPayPal: (username, itemName, userMessage, paypalEmail) =>
          `<h1>Hi ${username},</h1>
           <p>Your message regarding the item <strong>"${itemName}"</strong> has been <strong>approved</strong>.</p>
           <p><strong>Your message:</strong> "${userMessage}"</p>
           <p>Confirm your order - send payment to PayPal: <strong>${paypalEmail}</strong></p>
           <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      
        textWithCard: (username, itemName, userMessage, cardNumber) =>
          `Hi ${username},\n\nYour message regarding the item "${itemName}" has been approved.\n\nYour message: "${userMessage}"\n\nConfirm your order - use the following card credentials:\n\nCard Number: ${cardNumber}\n\nBest regards,\nCloudyForge Team`,
        htmlWithCard: (username, itemName, userMessage, cardNumber) =>
          `<h1>Hi ${username},</h1>
          <p>Your message regarding the item <strong>"${itemName}"</strong> has been <strong>approved</strong>.</p>
          <p><strong>Your message:</strong> "${userMessage}"</p>
          <p>Confirm your order - use the following card credentials:</p>
          <ul>
            <li><strong>Card Number:</strong> ${cardNumber}</li>
          </ul>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,

        // Add these new methods for crypto payments
        textWithETH: (username, itemName, userMessage, ethAddress) =>
          `Hi ${username},\n\nYour message regarding the item "${itemName}" has been approved.\n\nYour message: "${userMessage}"\n\nConfirm your order - send payment to Ethereum address: ${ethAddress}\n\nBest regards,\nCloudyForge Team`,
        htmlWithETH: (username, itemName, userMessage, ethAddress) =>
          `<h1>Hi ${username},</h1>
          <p>Your message regarding the item <strong>"${itemName}"</strong> has been <strong>approved</strong>.</p>
          <p><strong>Your message:</strong> "${userMessage}"</p>
          <p>Confirm your order - send payment to Ethereum address:</p>
          <p><strong>${ethAddress}</strong></p>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,

        textWithBTC: (username, itemName, userMessage, btcAddress) =>
          `Hi ${username},\n\nYour message regarding the item "${itemName}" has been approved.\n\nYour message: "${userMessage}"\n\nConfirm your order - send payment to Bitcoin address: ${btcAddress}\n\nBest regards,\nCloudyForge Team`,
        htmlWithBTC: (username, itemName, userMessage, btcAddress) =>
          `<h1>Hi ${username},</h1>
          <p>Your message regarding the item <strong>"${itemName}"</strong> has been <strong>approved</strong>.</p>
          <p><strong>Your message:</strong> "${userMessage}"</p>
          <p>Confirm your order - send payment to Bitcoin address:</p>
          <p><strong>${btcAddress}</strong></p>
          <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      },

      usernameChanged: {
        subject: 'Your username has been updated!',
        text: (oldName, newName) =>
          `Hello, ${oldName}!\n\nYour username has been changed. If you did not authorize this change, please contact support immediately.`,
        html: (oldName, newName) =>
          `<h1>Hi ${oldName},</h1>
           <p>Your username has been changed.</p>
           <p>If you did not authorize this change, please contact support immediately.</p>`,
      },
    
      passwordChanged: {
        subject: 'Your password has been updated!',
        text: (username) =>
          `Hello, ${username}!\n\nWe just wanted to let you know that your password has been updated. If you did not do this, please contact support immediately.`,
        html: (username) =>
          `<h1>Hi ${username},</h1>
           <p>We just wanted to let you know that your password has been updated.</p>
           <p>If you did not do this, please contact support immediately.</p>`,
      }, 
      auctionWon: {
        subject: 'Congratulations! You Won the Auction!',
        textWithPayPal: (username, itemName, finalPrice, paypalEmail) =>
          `Hi ${username},\n\nCongratulations on winning the auction for "${itemName}"! The final price is $${finalPrice.toFixed(
            2
          )}.\n\nTo complete your payment, please send the amount to the following PayPal address: ${paypalEmail}.\n\nAfter payment, send your data for delivery, namely:\n1. Country\n2. Full name\n3. Phone number\n4. Full address\n5. City\n6. Zip code\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
        htmlWithPayPal: (username, itemName, finalPrice, paypalEmail) =>
          `<h1>Hi ${username},</h1>
           <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
           <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
           <p>To complete your payment, please send the amount to the following PayPal address:</p>
           <p><strong>${paypalEmail}</strong></p>
           <p>After payment, send your data for delivery to <strong>cloudyforge@gmail.com</strong>, namely:</p>
           <ol>
             <li>Country</li>
             <li>Full name</li>
             <li>Phone number</li>
             <li>Full address</li>
             <li>City</li>
             <li>Zip code</li>
           </ol>
           <p>Thank you for participating!</p>
           <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,

        textWithCard: (username, itemName, finalPrice, cardNumber) =>
          `Hi ${username},\n\nCongratulations on winning the auction for "${itemName}"! The final price is $${finalPrice.toFixed(
            2
          )}.\n\nTo complete your payment, you can use the following card credentials:\n\nCard Number: ${cardNumber}\n\nAfter payment, send your data for delivery, namely:\n1. Country\n2. Full name\n3. Phone number\n4. Full address\n5. City\n6. Zip code\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
        htmlWithCard: (username, itemName, finalPrice, cardNumber) =>
          `<h1>Hi ${username},</h1>
           <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
           <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
           <p>To complete your payment, you can use the following card credentials:</p>
           <ul>
             <li><strong>Card Number:</strong> ${cardNumber}</li>
           </ul>
           <p>After payment, send your data for delivery to <strong>cloudyforge@gmail.com</strong>, namely:</p>
           <ol>
             <li>Country</li>
             <li>Full name</li>
             <li>Phone number</li>
             <li>Full address</li>
             <li>City</li>
             <li>Zip code</li>
           </ol>
           <p>Thank you for participating!</p>
           <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      
        textWithETH: (username, itemName, finalPrice, ethAddress) =>
          `Hi ${username},\n\nCongratulations on winning the auction for "${itemName}"! The final price is $${finalPrice.toFixed(
            2
          )}.\n\nTo complete your payment, please send the equivalent in ETH to the following Ethereum address: ${ethAddress}\n\nAfter payment, send your data for delivery, namely:\n1. Country\n2. Full name\n3. Phone number\n4. Full address\n5. City\n6. Zip code\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
        htmlWithETH: (username, itemName, finalPrice, ethAddress) =>
          `<h1>Hi ${username},</h1>
           <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
           <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
           <p>To complete your payment, please send the equivalent in ETH to the following Ethereum address:</p>
           <p><strong>${ethAddress}</strong></p>
           <p>After payment, send your data for delivery to <strong>cloudyforge@gmail.com</strong>, namely:</p>
           <ol>
             <li>Country</li>
             <li>Full name</li>
             <li>Phone number</li>
             <li>Full address</li>
             <li>City</li>
             <li>Zip code</li>
           </ol>
           <p>Thank you for participating!</p>
           <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      
        textWithBTC: (username, itemName, finalPrice, btcAddress) =>
          `Hi ${username},\n\nCongratulations on winning the auction for "${itemName}"! The final price is $${finalPrice.toFixed(
            2
          )}.\n\nTo complete your payment, please send the equivalent in BTC to the following Bitcoin address: ${btcAddress}\n\nAfter payment, send your data for delivery, namely:\n1. Country\n2. Full name\n3. Phone number\n4. Full address\n5. City\n6. Zip code\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
        htmlWithBTC: (username, itemName, finalPrice, btcAddress) =>
          `<h1>Hi ${username},</h1>
           <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
           <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
           <p>To complete your payment, please send the equivalent in BTC to the following Bitcoin address:</p>
           <p><strong>${btcAddress}</strong></p>
           <p>After payment, send your data for delivery to <strong>cloudyforge@gmail.com</strong>, namely:</p>
           <ol>
             <li>Country</li>
             <li>Full name</li>
             <li>Phone number</li>
             <li>Full address</li>
             <li>City</li>
             <li>Zip code</li>
           </ol>
           <p>Thank you for participating!</p>
           <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      },


last4Hours: {
  subject: 'The Last 4 Hours Before the End of the Auction!',
  text: (username) =>
    `DEAR ${username}!\n\n❗️THE LAST 4 HOURS BEFORE THE END OF THE AUCTION.\n\nHurry up to win a military artifact, that will become a memory of Ukraine and the funds from which will be used by the Ukrainian military in the fight.\n\nGood luck!`,
  html: (username) =>
    `<h1>DEAR ${username}!</h1>
    <p>❗️<strong>THE LAST 4 HOURS BEFORE THE END OF THE AUCTION.</strong></p>
    <p>Hurry up to win a military artifact, that will become a memory of Ukraine and the funds from which will be used by the Ukrainian military in the fight.</p>
                <p><a href="https://cloudyforge.com/en/auction" style="color: blue; text-decoration: underline;">Place a bid right now!</a></p>

    <p>Good luck!</p>`,
},

last1Hour: {
  subject: 'The Last Hour Before the End of the Auction!',
  text: (username) =>
    `DEAR ${username}!\n\n❗️THE LAST 1 HOUR BEFORE THE END OF THE AUCTION.\n\nHurry up to win a military artifact, that will become a memory of Ukraine and the funds from which will be used by the Ukrainian military in the fight.\n\nGood luck!`,
  html: (username) =>
    `<h1>DEAR ${username}!</h1>
    <p>❗️<strong>THE LAST 1 HOUR BEFORE THE END OF THE AUCTION.</strong></p>
    <p>Hurry up to win a military artifact, that will become a memory of Ukraine and the funds from which will be used by the Ukrainian military in the fight.</p>
          <p><a href="https://cloudyforge.com/en/auction" style="color: blue; text-decoration: underline;">Place a bid right now!</a></p>
    <p>Good luck!</p>`,
},
auctionStarted: {
  subject: 'The Auction Has Started!',
  text: (username) =>
    `DEAR ${username}!\n\n🔥 THE AUCTION HAS STARTED! 🔥\n\nThe bidding has begun! Don't miss your chance to win a unique military artifact while supporting the Ukrainian military.\n\nStart placing your bids now and secure your piece of history!\n\nGood luck!`,
  html: (username) =>
    `<h1>DEAR ${username}!</h1>
    <p>🔥 <strong>THE AUCTION HAS STARTED!</strong> 🔥</p>
    <p>The bidding has begun! Don't miss your chance to win a unique military artifact while supporting the Ukrainian military.</p>
    <p><a href="https://cloudyforge.com/en/auction" style="color: blue; text-decoration: underline;">Join the auction now!</a></p>
    <p>Start placing your bids and secure your piece of history!</p>
    <p>Good luck!</p>`,
},

auctionLastDay: {
  subject: 'The Last 24 Hours Before the End of the Auction!',
  text: (username) =>
    `DEAR ${username}!\n\n❗️THE LAST 24 HOURS BEFORE THE END OF THE AUCTION.\n\nThis is your last chance to win a truly unique lot and support the legendary Brigades!\n\nPlace a bid right now!\n\nGood luck!`,
  html: (username) =>
    `<h1>DEAR ${username}!</h1>
    <p>❗️<strong>THE LAST 24 HOURS BEFORE THE END OF THE AUCTION.</strong></p>
    <p>This is your last chance to win a truly unique lot and support the legendary Brigades!</p>
    <p><a href="https://cloudyforge.com/en/auction" style="color: blue; text-decoration: underline;">Place a bid right now!</a></p>
    <p>Good luck!</p>`,
},
}
  
