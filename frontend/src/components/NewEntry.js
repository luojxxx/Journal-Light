import React from 'react';

export default class NewEntry extends React.Component{
    constructor(props){
        super(props)
        this.state={};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.addEntry( this.props.idx );
        this.props.setScrollNull();
    }

    render() {
        let newEntryDividerLength = this.props.newEntryDividerLength;

        return (
            <div>
            { (this.props.searching === false) ?
                (<div className='addButton' onClick={() => this.handleClick()}>
                {/* <hr className='dividingLine' /> */}
                {'-'.repeat(newEntryDividerLength)+'<+>'+'-'.repeat(newEntryDividerLength)}
                </div>) :
                (<div className='addButton' >
                {/* <hr className='dividingLine' /> */}
                {'-'.repeat( (newEntryDividerLength*2) + 5 )}
                </div>) }
            </div>
            
        );
    }
};
