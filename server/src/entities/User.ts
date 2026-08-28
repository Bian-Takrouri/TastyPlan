import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    username!: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    email!: string;

    @Column({
        name: "password_hash",
        type: "varchar",
        length: 255
    })
    passwordHash!: string;

    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
    })
    role!: "admin" | "user";

    @CreateDateColumn({
        name: "created_at",
        type: "timestamp"
    })
    createdAt!: Date;
}