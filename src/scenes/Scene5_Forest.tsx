import { motion } from 'motion/react';
import { BirthdayMessage, AgeMessage } from '../ui/BirthdayMessage';
import { PhotoFrame } from '../ui/PhotoFrame';
import { ForestParticles } from '../effects/ForestParticles';
import { Equalizer } from '../effects/Equalizer';

export function Scene5_Forest() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1,
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ForestParticles />
      <Equalizer />
      <BirthdayMessage
        showButton={false}
        name="Айлександр"
        shortName="Айлександр"
        age={15}
        binaryAge="1111"
        message={"Ти думав тут шось буде???? ._. нє, нє, нє - весь бюджет(пачка чіпсів) пішов на анімації. А ну і, клікай мишкою щоб розкидувати конфетті"}
      />
      <PhotoFrame />
      <AgeMessage />
    </motion.div>
  );
}
