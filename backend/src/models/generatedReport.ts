import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GeneratedReportAttributes {
  reportId: number;
  reportName?: string;
  reportType: 'monthly' | 'weekly' | 'daily';
  reportData: object;
  createdAt?: Date;
}

interface GeneratedReportCreationAttributes extends Optional<GeneratedReportAttributes, 'reportId' | 'reportName' | 'createdAt'> {}

export class GeneratedReport extends Model<GeneratedReportAttributes, GeneratedReportCreationAttributes> implements GeneratedReportAttributes {
  public reportId!: number;
  public reportName?: string;
  public reportType!: 'monthly' | 'weekly' | 'daily';
  public reportData!: object;

  public readonly createdAt!: Date;
}

GeneratedReport.init(
  {
    reportId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'report_id',
    },
    reportName: {
      type: DataTypes.STRING(255),
      field: 'report_name',
    },
    reportType: {
      type: DataTypes.ENUM('monthly', 'weekly', 'daily'),
      allowNull: false,
      field: 'report_type',
    },
    reportData: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'report_data',
    },
  },
  {
    tableName: 'GeneratedReports',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
