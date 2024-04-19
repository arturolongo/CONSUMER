import { connect, Channel, ConsumeMessage } from "amqplib";
import axios from 'axios';

// Definir la clase Pago
class Cita {
    idCita: number;
    NombrePaciente: string;
    Problema: string;

    constructor(idCita: number, NombrePaciente: string, Problema: string) {
        this.idCita = idCita;
        this.NombrePaciente = NombrePaciente;
        this.Problema = Problema;
    }
}

async function main() {
    const connection = await connect('amqp://admin:zoe10208@34.198.106.93');
    const channel: Channel = await connection.createChannel();
    const queue: string = 'up.practica';
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (message: ConsumeMessage | null) => {
        if (message !== null) {
            try {
                const payload = message.content.toString();
                console.log('Message received:', payload);

            
                const cita: Cita = JSON.parse(payload);
                console.log('Pago object:', cita);

                const dataToSend = {
                    idServicio_Citas: cita.idCita,
                    descripcion: cita.Problema
                };
                console.log("datos a mandar")
                console.log(dataToSend)

                await axios.post('https://api-citas-1.onrender.com/agenda', dataToSend);
                console.log('Payment processed');
            } catch (error) {
                console.error('Error processing message:', error);
            } finally {
                channel.ack(message); 
            }
        }
    });
}

main().catch(console.error);
