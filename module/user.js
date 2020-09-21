module.exports = function(sequelize,DataTypes){
    return sequelize.define(
        'user',
        {
            id:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: true,
                autoIncrement: true
            },
            userName:{
                type: DataTypes.STRING,
                allowNull: false,
                field: 'userName'
            },
            password:{
                type: DataTypes.STRING,
                allowNull: false,
                field: 'password'
            }
        },
        {
            timestamps: false
        }
    );
}