import React, { useLayoutEffect, useState } from 'react';

const rough = require('roughjs/bundled/rough.cjs.js');

export default function Home() {
	const [elements, setElements] = useState<any>([]);
	const [action, setAction] = useState('none');
	const [tool, setTool] = useState('none');
	const [selectedElement, setSelectedElement] = useState<any>(null);

	const generator = rough.generator();

	const fetchCanvas = () => {
		const canvas = document.getElementById(
			'canvas'
		) as HTMLCanvasElement | null;

		if (canvas) {
			if (typeof window !== 'undefined') {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}

			const ctx = canvas.getContext('2d');
			const rc = rough.canvas(canvas);

			if (ctx) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				elements.forEach(({ roughElement }: any) => rc.draw(roughElement));
			}
		}
	};

	const createAnElement = (
		id: any,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		type: string
	) => {
		const roughElement =
			type === 'line'
				? generator.line(x1, y1, x2, y2)
				: generator.rectangle(x1, y1, x2 - x1, y2 - y1);
		return { id, x1, y1, x2, y2, type, roughElement };
	};

	const isWithinElement = (x: number, y: number, element: any) => {
		const { type, x1, x2, y1, y2 } = element;
		if (type === 'rectangle') {
			const minX = Math.min(x1, x2);
			const maxX = Math.max(x1, x2);
			const minY = Math.min(y1, y2);
			const maxY = Math.max(y1, y2);
			return x >= minX && x <= maxX && y >= minY && y <= maxY;
		} else {
			const a = { x: x1, y: y1 };
			const b = { x: x2, y: y2 };
			const c = { x, y };
			const offset = distance(a, b) - (distance(a, c) + distance(b, c));
			return Math.abs(offset) < 1;
		}
	};

	const distance = (a: any, b: any) =>
		Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

	const getElementAtPosition = (x: number, y: number, elements: any) => {
		return elements.find((element: any) => isWithinElement(x, y, element));
	};

	const updateElement = (
		id: any,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		type: any
	) => {
		const updatedElement = createAnElement(id, x1, y1, x2, y2, type);

		const elementsCopy = [...elements];
		elementsCopy[id] = updatedElement;
		setElements(elementsCopy);
	};

	const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const { clientX, clientY } = event;
		if (tool === 'selection') {
			const element = getElementAtPosition(clientX, clientY, elements);
			if (element) {
				setSelectedElement(element);
				setAction('moving');
			}
		} else {
			const id = elements.length;
			const element = createAnElement(
				id,
				clientX,
				clientY,
				clientX,
				clientY,
				tool
			);
			setElements((prev: any) => [...prev, element]);
			setAction('drawing');
		}
	};

	const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const { clientX, clientY } = event;
		if (action === 'drawing') {
			const index = elements.length - 1;
			const { x1, y1 } = elements[index];
			updateElement(index, x1, y1, clientX, clientY, tool);
		} else if (action === 'moving') {
			const { id, x1, x2, y1, y2, type } = selectedElement;
			const width = x2 - x1;
			const height = y2 - y1;
			updateElement(
				id,
				clientX,
				clientY,
				clientX + width,
				clientY + height,
				type
			);
		}
	};

	const handleMouseUp = () => {
		setAction('none');
		setSelectedElement(null);
	};

	useLayoutEffect(() => {
		fetchCanvas();
	}, [elements]);

	return (
		<div>
			<div style={{ position: 'fixed' }}>
				<input
					type="radio"
					id="selection"
					checked={tool === 'selection'}
					onChange={() => setTool('selection')}
				/>
				<label htmlFor="selection">Selection</label>
				<input
					type="radio"
					id="line"
					checked={tool === 'line'}
					onChange={() => setTool('line')}
				/>
				<label htmlFor="line">Line</label>
				<input
					type="radio"
					id="rectangle"
					checked={tool === 'rectangle'}
					onChange={() => setTool('rectangle')}
				/>
				<label htmlFor="rectangle">Rectangle</label>
			</div>
			<canvas
				id="canvas"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			></canvas>
		</div>
	);
}
