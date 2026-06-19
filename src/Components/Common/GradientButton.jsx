import React from 'react';
import Button from './Button';

// GradientButton — thin wrapper kept for backwards compatibility.
// New code should use <Button variant="gradient" />.
const GradientButton = ({ title, onPress, style, textStyle, colors, size = 'lg', ...rest }) => (
  <Button
    title={title}
    onPress={onPress}
    variant="gradient"
    size={size}
    gradientColors={colors}
    style={style}
    textStyle={textStyle}
    {...rest}
  />
);

export default GradientButton;
