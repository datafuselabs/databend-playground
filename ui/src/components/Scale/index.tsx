import IconFont from '@/assets/scss/icon';
import { FC, ReactElement } from 'react';
interface Iprops {
  isLarge: boolean;
  onClick?: ()=>void;
  className?: string;
  style?: any;
}
const Scale: FC<Iprops> = ({
	isLarge, onClick, className, style
}): ReactElement => {
	return (
		<>
			<IconFont className={className} onClick={onClick} style={{fontSize: '25px', cursor: 'pointer', ...style}} type={!isLarge?'databend-kuoda1':'databend-suoxiao'}></IconFont>
		</>
	);
};
export default Scale;
