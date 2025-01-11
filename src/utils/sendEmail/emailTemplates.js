// utils/emailTemplates.js
export const templates = {
    welcome: {
        subject: 'Welcome to WarAuction!',
        text: (username) => `Hello, ${username}! Welcome to WarAuction.`,
        html: (username) =>
          `<h1>Hello, ${username}!</h1><p>Welcome to WarAuction.</p>`,
      },
    bidAccepted: {
          subject: 'Your Bid Has Been Successfully Placed!',
          text: (username, itemName, bidAmount) =>
            `Hi ${username},\n\nYour bid of $${bidAmount} on "${itemName}" has been successfully placed. You are currently the highest bidder!\n\nGood luck!\n\nBest regards,\nWarAuction Team`,
          html: (username, itemName, bidAmount) =>
            `<h1>Hi ${username},</h1>
            <p>Your bid of <strong>$${bidAmount}</strong> on <em>${itemName}</em> has been successfully placed.</p>
            <p>You are currently the highest bidder! Good luck!</p>
            <p>Best regards,<br/><strong>WarAuction Team</strong></p>`,
        },
      
        // Шаблон 2: Ваша ставка перебита
        bidOvertaken: {
          subject: 'Your Bid Has Been Outbid!',
          text: (username, itemName, currentBid) =>
            `Hi ${username},\n\nUnfortunately, your bid on "${itemName}" has been outbid. The current highest bid is now $${currentBid}.\n\nYou can place a new bid to stay in the game!\n\nBest regards,\nWarAuction Team`,
          html: (username, itemName, currentBid) =>
            `<h1>Hi ${username},</h1>
            <p>Unfortunately, your bid on <em>${itemName}</em> has been outbid.</p>
            <p>The current highest bid is now <strong>$${currentBid}</strong>.</p>
            <p><a href="https://warauction.com/auction/${itemName}" style="color: blue; text-decoration: underline;">Place a new bid</a> to stay in the game!</p>
            <p>Best regards,<br/><strong>WarAuction Team</strong></p>`,
        },
      
        // Шаблон 3: Сообщение по амуниции принято
        messageAccepted: {
          subject: 'Your Ammunition Request Has Been Sent!',
          text: (username, itemName, cost, userMessage) =>
            `Hi ${username},\n\nYour message regarding the item "${itemName}" has been sent succesfully. You paid $${cost.toFixed(
              2
            )} for this item.\n\nYour message: "${userMessage}"\n\nPlease wait for further response or updates.\n\nThank you for your patience!\n\nBest regards,\nWarAuction Team`,
          html: (username, itemName, cost, userMessage) =>
            `<h1>Hi ${username},</h1>
             <p>Your message regarding the item <strong>"${itemName}"</strong> has been <strong>approved</strong> by an admin.</p>
             <p>You paid <strong>$${cost.toFixed(2)}</strong> for this item.</p>
             <p><strong>Your message:</strong> "${userMessage}"</p>
             <p>Please wait for further response or updates.</p>
             <p>Thank you for your patience!</p>
             <p>Best regards,<br/><strong>WarAuction Team</strong></p>`,
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
      };
    