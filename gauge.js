import React from 'react'
import {Animated, Dimensions, Easing, Image, StyleSheet, Text, View} from 'react-native'

let deviceWidth = Dimensions.get('window').width;
let deviceHeight = Dimensions.get('window').height;
let width = (deviceWidth < deviceHeight) ? deviceWidth / 1.5 : deviceHeight / 1.5;
const easeDuration = 500;
const needleImage = require('../Images/gauge_needle.png');
const RADIUS = 0.7;
const GRADUATION_SIZE = 0.05;

class Gauge extends React.Component {

    constructor(props) {
        super(props);
        if (this.props.value == null) {
            this.props.value = 0;
        }
        this.speedometerValue = new Animated.Value(this.props.value)
        this.gaugeRange = (this.props.gaugeRange <= 270 && this.props.gaugeRange >= 180) ? this.props.gaugeRange : (this.props.gaugeRange < 180) ? 180 : 270;
        this.borderMargin = this.props.borderMargin;
        if (this.props.settings.maxValue < this.props.settings.minValue) {
            throw new Error('The maximum value of the gauge is less than the minimum value')
        }
    }

    // return the label from a value with the gauge_settings
    getLabelFromValue(value, gaugeLabels) {
        let label = [];
        for (let i = 0; i < gaugeLabels.length; i++) {
            if (gaugeLabels[i].min <= value && value <= gaugeLabels[i].max) {
                label = gaugeLabels[i];
                break;
            }
        }
        return label;
    }

    limitValue(value) {
        let currentValue = 0;
        if (!isNaN(value)) {
            currentValue = value;
        }
        return Math.min(Math.max(currentValue, this.props.settings.minValue), this.props.settings.maxValue);
    }

    addArcs() {
        let circleDegree = '';
        let lastLevelColor = null;
        let gaugeStart = (360 - this.gaugeRange) / 2;
        let rectangles = [];

        this.props.settings.range.map((level, index) => {
            rectangles[index] = [];
            const perLevelDegree = ((level.min - this.props.settings.minValue) / (this.props.settings.maxValue - this.props.settings.minValue)) * this.gaugeRange;
            circleDegree = (gaugeStart + (perLevelDegree)).toString();
            lastLevelColor = level.color;
            rectangles[index][0] =
                <View
                    key={index}
                    style={[styles.halfCircle, {
                        backgroundColor: level.color,
                        transform: [
                            {rotate: circleDegree + 'deg'},
                            {translateX: -width / 4},
                        ],
                    }]}
                />;

            if ((Number(circleDegree) - gaugeStart + 90) > this.gaugeRange) {
                rectangles[index][0] =
                    <View
                        key={index}
                        style={[styles.halfCircleBySquare, {
                            backgroundColor: level.color,
                            transform: [
                                {rotate: circleDegree + 'deg'},
                                {translateX: -width / 4},
                                {translateY: width / 4},
                            ],
                        }]}
                    />
            }
            let nextRectangleDegree = (this.props.settings.range[index + 1]) ? (gaugeStart + (((this.props.settings.range[index + 1].min - this.props.settings.minValue) / (this.props.settings.maxValue - this.props.settings.minValue)) * this.gaugeRange)).toString() : 0;

            if ((Number(circleDegree) - gaugeStart + 180) < nextRectangleDegree) {
                // calculation of the new rectangle degrees with the missing gap : nextRectangleDegree - (Number(circleDegree) - gaugeStart + 180)
                // Was Number(circleDegree) + (nextRectangleDegree - (Number(circleDegree) - gaugeStart + 180))     but simplified it look like :
                let newRectangleDegree = nextRectangleDegree + gaugeStart - 180;
                rectangles[index][1] =
                    <View
                        key={index + 20}
                        style={[styles.halfCircle, {
                            backgroundColor: level.color,
                            transform: [
                                {rotate: newRectangleDegree.toString() + 'deg'},
                                {translateX: -width / 4},
                            ],
                        }]}
                    />
            } else {
                rectangles[index][1] = null;
            }
        });

        let addCircle = 0;
        if ((Number(circleDegree) - gaugeStart + 180) < this.gaugeRange) {
            addCircle = this.gaugeRange - (Number(circleDegree) + 180 - gaugeStart) + Number(circleDegree);
            rectangles.push(
                <View
                    key={addCircle}
                    style={[styles.halfCircle, {
                        backgroundColor: lastLevelColor,
                        transform: [
                            {rotate: addCircle.toString() + 'deg'},
                            {translateX: -width / 4},
                        ],
                    }]}
                />)
        }

        return rectangles;
    }

    addGraduation() {
        let gaugeStart = (360 - this.gaugeRange) / 2;
        let id = 0;
        let graduation = [];
        for (let i = gaugeStart - 180; i <= gaugeStart + this.gaugeRange - 180; i += this.gaugeRange / 20) {
            graduation[id] = (id % 5 !== 0) ?
                <View
                    key={id}
                    style={[styles.graduation, {
                        transform: [

                            {rotate: i.toString() + 'deg'},
                            {translateY: -(width * RADIUS) / 2 - (width * GRADUATION_SIZE) / 2},
                        ]
                    }]}
                />
                :
                <View
                    key={id}
                    style={[styles.graduationBig, {
                        transform: [

                            {rotate: i.toString() + 'deg'},
                            {translateY: -(width * RADIUS) / 2 - (width * (GRADUATION_SIZE) * 1.5) / 2},
                        ]
                    }]}
                />;

            id++;
        }
        return graduation;
    }

    eraseBottom() {
        let squares = [];
        let gaugeStart = (360 - this.gaugeRange) / 2;
        squares[0] =
            <View
                key={0}
                style={[styles.square, {
                    transform: [
                        {rotate: gaugeStart.toString() + 'deg'},
                        {translateY: width / 4},
                        {translateX: width / 4},
                    ],
                }]}
            />;


        if (gaugeStart > 45) {
            // shift until 0 starting from 45 degrees
            let rotate = 90 - gaugeStart;
            squares[1] =
                <View
                    key={1}
                    style={[styles.square, {
                        transform: [
                            {rotate: rotate.toString() + 'deg'},
                            {translateY: width / 4},
                            {translateX: width / 4},
                        ],
                    }]}
                />;
        }
        return squares;
    }


    render() {
        const label = this.getLabelFromValue(this.limitValue(this.props.value), this.props.settings.range);
        Animated.timing(
            this.speedometerValue,
            {
                toValue: this.limitValue(this.props.value),
                duration: easeDuration,
                easing: Easing.linear,
            },
        ).start();
        const rotate = this.speedometerValue.interpolate({
            inputRange: [this.props.settings.minValue, this.props.settings.maxValue],
            outputRange: ['-' + this.gaugeRange / 2 + 'deg', this.gaugeRange / 2 + 'deg'],
        });

        return (
            <View style={styles.wrapper}>
                <View
                    style={[styles.outerCircle, {width: width - this.borderMargin, height: width - this.borderMargin}]}>
                    {this.addArcs()}
                    {this.addGraduation()}
                    <Animated.View style={[styles.imageWrapper, {
                        transform: [{rotate}],
                    }]}>
                        <Image style={styles.image} source={needleImage}/>
                    </Animated.View>
                    <View style={styles.innerCircle}/>
                    {this.eraseBottom()}
                </View>
                <View style={styles.labelWrapper}>
                    <Text style={styles.label}>{this.limitValue(this.props.value)}</Text>
                    <Text style={[styles.labelNote, {color: label.color}]}> {label.text} </Text>
                    <Text style={styles.label}> {this.props.settings.tittle} </Text>
                </View>
            </View>
        )
    }
}
  
const styles = StyleSheet.create({
    wrapper: {
        flex: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    outerCircle: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: width / 2,
        borderTopRightRadius: width / 2,
        borderBottomLeftRadius: width / 2,
        borderBottomRightRadius: width / 2,
        overflow: 'hidden',
        borderColor: '#ffffff',
        backgroundColor: '#ffffff',
    },
    innerCircle: {
        position: 'absolute',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        width: width * RADIUS,
        height: width * RADIUS,
        borderTopLeftRadius: width / 2 - 10,
        borderTopRightRadius: width / 2 - 10,
        borderBottomLeftRadius: width / 2 - 10,
        borderBottomRightRadius: width / 2 - 10,
    },
    square: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: width / 2,
        height: width / 2,
    },
    graduation: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.28)',
        width: 2,
        height: width * GRADUATION_SIZE,
    },
    graduationBig: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.91)',
        width: 3,
        height: width * (GRADUATION_SIZE) * 1.5,
    },
    halfCircle: {
        position: 'absolute',
        width: width / 2,
        height: width,
    },
    halfCircleBySquare: {
        position: 'absolute',
        width: width / 2,
        height: width / 2,
    },
    imageWrapper: {
        alignItems: 'center',
        zIndex: 10,
    },
    image: {
        resizeMode: 'stretch',
        height: width,
        width: width,
    },
    labelWrapper: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
    },
    label: {
        fontSize: 19,
        fontWeight: 'bold',
    },
    labelNote: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Gauge
