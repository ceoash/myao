declare module '*.png' {
    const value: any;
    export = value;
}

/root/.acme.sh/acme.sh --issue -d node.cloudsenta.com -d node.cloudsenta.com --cert-file /etc/letsencrypt/live/www.rmronsol.com/cert.pem --key-file /etc/letsencrypt/live/node.cloudsenta.com/privkey.pem --fullchain-file /etc/letsencrypt/live/node.cloudsenta.com/fullchain.pem -w /home/node.cloudsenta.com/public_html --server letsencrypt --force --debug 