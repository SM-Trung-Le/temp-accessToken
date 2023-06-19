const axios = require('axios').default
const ethers = require('ethers')
require('dotenv').config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)

const main = async () => {
    const serverUrl = 'https://athena.skymavis.com/v2/public/auth/ronin/fetch-nonce'
    await axios.get(serverUrl + '?address=' + wallet.address)
        .then((response) => {
            let data = response.data
            signMessage(data)
        })
}

const signMessage = async (data) => {
    let domain = `YOUR_DOMAIN_GOES_HERE` 
    let uri = "https://YOUR_APP_URI" 
    let statement = `YOUR_STATEMENT` // Could be anything

    let message = `${domain} wants you to sign in with your Ronin account:\n${wallet.address.replace('0x', 'ronin:').toLowerCase()}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: 2020\nNonce: ${data.nonce}\nIssued At: ${data.issued_at}\nExpiration Time: ${data.expiration_time}\nNot Before: ${data.not_before}`

    /* 
        Example message: 
        app.axieinfinity.com wants you to sign in with your Ronin account: ronin:af9d50d8e6e19e3163583f293bb9b457cd28e8af I accept the Terms of Use (https://axieinfinity.com/terms-of-use) and the Privacy Policy (https://axieinfinity.com/privacy-policy) URI: https://app.axieinfinity.com Version: 1 Chain ID: 2020 Nonce: 13706446796901304963 Issued At: 2023-06-16T14:05:11Z Expiration Time: 2023-06-16T14:05:41Z Not Before: 2023-06-16T14:05:11Z
    */

    let signature = await wallet.signMessage(message)
    exchangeToken(signature, message)
}

const exchangeToken = async (signature, message) => {
    axios.post('https://athena.skymavis.com/v2/public/auth/ronin/login', {
        signature: signature,
        message: message
    })
        .then(async (response) => {
            let accessToken = response.data.accessToken
            console.log(accessToken)
        })
}

const refreshToken = async (refreshToken) => { // Optional 
    let url = 'https://athena.skymavis.com/v2/public/auth/token/refresh'
    await axios.post(url, {
        refreshToken: refreshToken
    }).then((response) => {
        let data = response.data
        let newAccessToken = data.accessToken
        let newRefreshToken = data.refreshToken
    })
}

main()