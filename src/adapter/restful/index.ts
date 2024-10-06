import app from './app';

const getPort = (mayBePortText: string | undefined): number => {
    const DEFAULT_PORT = 3000;
    if (mayBePortText == null) {
        return DEFAULT_PORT;
    }
    const mayBePortNumber = Number(mayBePortText);
    if (Number.isNaN(mayBePortNumber)) {
        return DEFAULT_PORT;
    } else {
        return mayBePortNumber;
    }
}

const port = getPort(process.env.RESTFUL_API_PORT);

app.listen(port, () => {
    console.log(`listening port: ${port}`);
});