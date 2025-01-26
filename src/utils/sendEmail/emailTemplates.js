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
      
        // Шаблон 2: Ваша ставка перебита
        bidOvertaken: {
          subject: 'Your Bid Has Been Outbid!',
          text: (username, itemName, currentBid) =>
            `Hi ${username},\n\nUnfortunately, your bid on "${itemName}" has been outbid. The current highest bid is now $${currentBid}.\n\nYou can place a new bid to stay in the game!\n\nBest regards,\nCloudyForge Team`,
          html: (username, itemName, currentBid) =>
            `<h1>Hi ${username},</h1>
            <p>Unfortunately, your bid on <em>${itemName}</em> has been outbid.</p>
            <p>The current highest bid is now <strong>$${currentBid}</strong>.</p>
            <p><a href="https://cloudyforge.com/auction" style="color: blue; text-decoration: underline;">Place a new bid</a> to stay in the game!</p>
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
            )}.\n\nTo complete your payment, please send the amount to the following PayPal address: ${paypalEmail}.\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
          htmlWithPayPal: (username, itemName, finalPrice, paypalEmail) =>
            `<h1>Hi ${username},</h1>
             <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
             <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
             <p>To complete your payment, please send the amount to the following PayPal address:</p>
             <p><strong>${paypalEmail}</strong></p>
             <p>Thank you for participating!</p>
             <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
      
          textWithCard: (username, itemName, finalPrice, cardNumber, cardHolder, expiryDate) =>
            `Hi ${username},\n\nCongratulations on winning the auction for "${itemName}"! The final price is $${finalPrice.toFixed(
              2
            )}.\n\nTo complete your payment, you can use the following card credentials:\n\nCard Number: ${cardNumber}\nCardholder Name: ${cardHolder}\nExpiry Date: ${expiryDate}\n\nThank you for participating!\n\nBest regards,\nCloudyForge Team`,
          htmlWithCard: (username, itemName, finalPrice, cardNumber, cardHolder, expiryDate) =>
            `<h1>Hi ${username},</h1>
             <p>Congratulations on winning the auction for <strong>"${itemName}"</strong>!</p>
             <p>The final price is <strong>$${finalPrice.toFixed(2)}</strong>.</p>
             <p>To complete your payment, you can use the following card credentials:</p>
             <ul>
               <li><strong>Card Number:</strong> ${cardNumber}</li>
             </ul>
             <p>Thank you for participating!</p>
             <p>Best regards,<br/><strong>CloudyForge Team</strong></p>`,
        },
      
      };
    