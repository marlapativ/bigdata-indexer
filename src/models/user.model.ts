import { DataTypes, Model } from 'sequelize'
import database from '../config/database'

class User extends Model {
  public id!: string
  public first_name!: string
  public last_name!: string
  public username!: string
  public password!: string
  public account_created!: Date
  public account_updated!: Date

  toJSON(): object {
    const values = Object.assign({}, this.get())
    delete values.password
    return values
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize: database.getDatabaseConnection(),
    modelName: 'User',
    tableName: 'User',
    timestamps: true,
    createdAt: 'account_created',
    updatedAt: 'account_updated',
    defaultScope: {
      attributes: {
        exclude: ['password']
      }
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ['password']
        }
      }
    }
  }
)

export default User
